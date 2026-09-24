import { open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { config as loadEnv } from 'dotenv';
import ts from 'typescript';
import type { TripleDay } from '../src/content/types';
import { generateCityFacts } from './cityFacts';
import type { CityFact } from './cityFacts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = resolve(root, 'src/content/tripleDays.ts');
const lockPath = resolve(root, 'scripts/.generate-days.lock');

async function readDays(): Promise<TripleDay[]> {
  const source = await readFile(manifestPath, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  return module.tripleDays as TripleDay[];
}

function insertFact(source: string, { id, fact, sourceUrl }: CityFact): string {
  const marker = `"id": ${JSON.stringify(id)}`;
  const roundStart = source.indexOf(marker);
  if (roundStart < 0) throw new Error(`Could not find ${id} in the manifest.`);
  const nextRound = source.indexOf('"id": "joshle-triple-', roundStart + marker.length);
  const roundEnd = nextRound < 0 ? source.length : nextRound;
  const factKey = source.indexOf('"fact": ', roundStart);
  if (factKey < 0 || factKey >= roundEnd) throw new Error(`Could not find ${id}'s fact.`);
  const lineEnd = source.indexOf('\n', factKey);
  if (lineEnd < 0 || lineEnd >= roundEnd) throw new Error(`Could not replace ${id}'s fact.`);
  const indent = source.slice(source.lastIndexOf('\n', factKey) + 1, factKey);
  return `${source.slice(0, factKey)}"fact": ${JSON.stringify(fact)},\n${indent}"factSourceUrl": ${JSON.stringify(sourceUrl)},${source.slice(lineEnd)}`;
}

async function main() {
  const dryRun = process.argv.slice(2).includes('--dry-run');
  if (process.argv.slice(2).some((arg) => arg !== '--dry-run')) throw new Error('Only --dry-run is supported.');
  const days = await readDays();
  const pending = days.filter((day) => day.rounds.some((round) => !round.factSourceUrl));
  console.log(`${pending.length} days need facts (${pending.reduce((sum, day) => sum + day.rounds.filter((round) => !round.factSourceUrl).length, 0)} rounds).`);
  if (dryRun || !pending.length) return;
  loadEnv({ path: resolve(root, '.env.local'), quiet: true });
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing.');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  for (const day of pending) {
    const rounds = day.rounds.filter((round) => !round.factSourceUrl);
    console.log(`${day.date}: researching ${rounds.map((round) => round.answer.label).join(' · ')}`);
    const facts = await generateCityFacts(ai, rounds.map((round) => ({
      id: round.id, label: round.answer.label, lat: round.answer.lat, lng: round.answer.lng,
    })));
    let source = await readFile(manifestPath, 'utf8');
    for (const fact of facts) source = insertFact(source, fact);
    const temporary = `${manifestPath}.tmp`;
    await writeFile(temporary, source);
    await rename(temporary, manifestPath);
    console.log(`  Saved ${facts.length} sourced facts.`);
  }
}

let lock: Awaited<ReturnType<typeof open>> | undefined;
try {
  lock = await open(lockPath, 'wx');
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'City fact retrofit failed.');
  process.exitCode = 1;
} finally {
  if (lock) { await lock.close(); await unlink(lockPath); }
}
