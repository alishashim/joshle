import { access, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { config as loadEnv } from 'dotenv';
import ts from 'typescript';
import type { TripleDay } from '../src/content/types';
import type { Location } from './dayPlanner';
import { generateSceneImage } from './generateScene';
import catalog from './location-catalog.json';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const lockPath = resolve(root, 'scripts/.generate-days.lock');

async function main() {
  const args = process.argv.slice(2);
  const date = args[args.indexOf('--date') + 1];
  const difficulty = args[args.indexOf('--difficulty') + 1];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !['easy', 'medium', 'hard'].includes(difficulty))
    throw new Error('Usage: npm run generate-round-image -- --date YYYY-MM-DD --difficulty easy|medium|hard');
  const source = await readFile(resolve(root, 'src/content/tripleDays.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { tripleDays } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`) as { tripleDays: TripleDay[] };
  const round = tripleDays.find((day) => day.date === date)?.rounds.find((entry) => entry.difficulty === difficulty);
  if (!round) throw new Error(`No ${difficulty} round exists for ${date}.`);
  const place = (catalog as Location[]).find((entry) => entry.geonameId === round.generation?.geonameId);
  if (!place || place.difficulty !== difficulty) throw new Error('The round needs a matching location catalog entry.');
  const imagePath = resolve(root, 'public', `.${round.image.src}`);
  try { await access(imagePath); throw new Error(`${round.image.src} already exists; choose a new path in the manifest before generating.`); }
  catch (error) { if (error instanceof Error && !('code' in error && error.code === 'ENOENT')) throw error; }
  loadEnv({ path: resolve(root, '.env.local'), quiet: true });
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing.');
  const references: [string, string] = [
    (await readFile(resolve(root, 'josh.jpg'))).toString('base64'),
    (await readFile(resolve(root, 'josh-cutout.jpg'))).toString('base64'),
  ];
  console.log(`Generating ${date} ${difficulty}: ${round.answer.label}`);
  const image = await generateSceneImage(new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }), place, references);
  const temporary = `${imagePath}.tmp`;
  await writeFile(temporary, image);
  await rename(temporary, imagePath);
  console.log(`Saved ${round.image.src} (${Math.round(image.length / 1024)} KiB).`);
}

let lock: Awaited<ReturnType<typeof open>> | undefined;
try {
  lock = await open(lockPath, 'wx');
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Round image generation failed.');
  process.exitCode = 1;
} finally {
  if (lock) { await lock.close(); await unlink(lockPath); }
}
