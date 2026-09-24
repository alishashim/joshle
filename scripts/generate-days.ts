import { access, copyFile, mkdir, open, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { config as loadEnv } from 'dotenv';
import sharp from 'sharp';
import ts from 'typescript';
import type { TripleDay } from '../src/content/types';
import { assertReadyToPublish, planDay } from './dayPlanner';
import type { Location } from './dayPlanner';
import { generateCityFacts } from './cityFacts';
import { generateSceneImage, statusOf } from './generateScene';
import catalog from './location-catalog.json';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = resolve(root, 'src/content/tripleDays.ts');
const stageRoot = resolve(root, 'scripts/.generated-days');
const lockPath = resolve(root, 'scripts/.generate-days.lock');
const locations = catalog as Location[];

function options(args: string[]) {
  let count: number | undefined, through: string | undefined, dryRun = false, force = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--count') count = Number(args[++index]);
    else if (args[index] === '--through') through = args[++index];
    else if (args[index] === '--dry-run') dryRun = true;
    else if (args[index] === '--force') force = true;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  if ((count === undefined) === (through === undefined)) throw new Error('Use either --count or --through.');
  if (count !== undefined && (!Number.isSafeInteger(count) || count < 1 || count > 30)) throw new Error('--count must be an integer from 1 to 30.');
  if (through !== undefined && (!/^\d{4}-\d{2}-\d{2}$/.test(through) || Number.isNaN(Date.parse(`${through}T12:00:00Z`))))
    throw new Error('--through must be a valid YYYY-MM-DD date.');
  return { count, through, dryRun, force };
}

async function exists(path: string) {
  try { await access(path); return true; } catch { return false; }
}

async function atomicWrite(path: string, contents: string | Buffer) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, contents);
  await rename(temporary, path);
}

async function readDays(): Promise<TripleDay[]> {
  const source = await readFile(manifestPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    reportDiagnostics: true,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  if (transpiled.diagnostics?.length) throw new Error('Triple-day manifest has a syntax error.');
  const module = await import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`);
  return module.tripleDays as TripleDay[];
}

async function publishDay(day: TripleDay, stageDir: string) {
  const validImages: boolean[] = [];
  for (const round of day.rounds) {
    const staged = resolve(stageDir, `${round.difficulty}.webp`);
    const final = resolve(root, 'public', `.${round.image.src}`);
    const source = await exists(staged) ? staged : final;
    if (!(await exists(source))) { validImages.push(false); continue; }
    const metadata = await sharp(source).metadata();
    validImages.push(metadata.format === 'webp' && Boolean(metadata.width && metadata.height));
  }
  assertReadyToPublish(day, validImages);
  for (const round of day.rounds) {
    const staged = resolve(stageDir, `${round.difficulty}.webp`);
    if (await exists(staged)) await copyFile(staged, resolve(root, 'public', `.${round.image.src}`));
  }
  const source = await readFile(manifestPath, 'utf8');
  const end = source.lastIndexOf('\n];');
  if (end < 0) throw new Error('Could not find the end of the triple-day list.');
  const entry = JSON.stringify(day, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
  const before = source.slice(0, end).trimEnd();
  const separator = before.endsWith('[') || before.endsWith(',') ? '\n' : ',\n';
  await atomicWrite(manifestPath, `${before}${separator}${entry},${source.slice(end)}`);
  await rm(stageDir, { recursive: true, force: true });
}

async function main() {
  const { count: requestedCount, through, dryRun, force } = options(process.argv.slice(2));
  if (new Set(locations.map((place) => place.geonameId)).size !== locations.length) throw new Error('Location catalog has duplicate GeoNames IDs.');
  const days = await readDays();
  const latest = days.map((day) => day.date).sort().at(-1) ?? '2026-09-22';
  const count = through
    ? Math.max(0, Math.round((Date.parse(`${through}T12:00:00Z`) - Date.parse(`${latest}T12:00:00Z`)) / 86_400_000))
    : requestedCount!;
  if (count > 30) throw new Error('--through needs more than 30 days; use smaller batches.');
  if (count === 0) { console.log(`Already authored through ${through}.`); return; }
  if (dryRun) {
    for (let index = 0; index < count; index++) {
      const day = planDay(days, locations);
      console.log(`[${index + 1}/${count}] ${day.id} ${day.date}: ${day.rounds.map((round) => `${round.difficulty} ${round.answer.label}`).join(' · ')}`);
      days.push(day);
    }
    console.log(`Dry run: planned ${count}; succeeded 0; failed 0; skipped 0. No files or API calls.`);
    return;
  }
  loadEnv({ path: resolve(root, '.env.local'), quiet: true });
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is missing from the environment or .env.local.');
  const references: [string, string] = [
    (await readFile(resolve(root, 'josh.jpg'))).toString('base64'),
    (await readFile(resolve(root, 'josh-cutout.jpg'))).toString('base64'),
  ];
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let succeeded = 0, failed = 0, skipped = 0;
  for (let index = 0; index < count; index++) {
    const planned = planDay(days, locations);
    const stageDir = resolve(stageRoot, planned.date);
    const draftPath = resolve(stageDir, 'draft.json');
    await mkdir(stageDir, { recursive: true });
    const day = await exists(draftPath) ? JSON.parse(await readFile(draftPath, 'utf8')) as TripleDay : planned;
    if (day.id !== planned.id || day.date !== planned.date) throw new Error('Staged day does not match the next unpublished date.');
    if (!(await exists(draftPath))) await atomicWrite(draftPath, `${JSON.stringify(day, null, 2)}\n`);
    console.log(`[${index + 1}/${count}] ${day.id} ${day.date}`);
    try {
      const imageResults = await Promise.allSettled(day.rounds.map(async (round) => {
        const staged = resolve(stageDir, `${round.difficulty}.webp`);
        const final = resolve(root, 'public', `.${round.image.src}`);
        if (!force && (await exists(staged) || await exists(final))) {
          console.log(`  Reusing ${round.difficulty} image.`);
          skipped++;
          return;
        }
        const place = locations.find((item) => item.geonameId === round.generation?.geonameId);
        if (!place || place.difficulty !== round.difficulty) throw new Error(`Invalid ${round.difficulty} draft location.`);
        console.log(`  Generating ${round.difficulty}: ${round.answer.label}`);
        const image = await generateSceneImage(ai, place, references);
        await atomicWrite(staged, image);
        console.log(`  Saved ${round.difficulty} (${Math.round(image.length / 1024)} KiB).`);
      }));
      const imageFailure = imageResults.find((result) => result.status === 'rejected');
      if (imageFailure?.status === 'rejected') throw imageFailure.reason;
      const missingFacts = day.rounds.filter((round) => !round.factSourceUrl);
      if (missingFacts.length) {
        console.log(`  Researching ${missingFacts.length} city facts.`);
        const facts = await generateCityFacts(ai, missingFacts.map((round) => ({
          id: round.id, label: round.answer.label, lat: round.answer.lat, lng: round.answer.lng,
        })));
        for (const fact of facts) {
          const round = day.rounds.find((entry) => entry.id === fact.id)!;
          round.fact = fact.fact;
          round.factSourceUrl = fact.sourceUrl;
        }
        await atomicWrite(draftPath, `${JSON.stringify(day, null, 2)}\n`);
      }
      await publishDay(day, stageDir);
      days.push(day);
      succeeded++;
      console.log(`  Published complete day ${day.date}.`);
    } catch (error) {
      const status = statusOf(error);
      console.error(`  Failed: ${status === 402 ? 'API HTTP 402 (enable billing for Gemini image generation)' : status ? `API HTTP ${status}` : error instanceof Error ? error.message : 'generation error'}. Staged rounds remain resumable.`);
      failed++;
      break;
    }
  }
  console.log(`Summary: succeeded ${succeeded}; failed ${failed}; reused rounds ${skipped}.`);
  if (failed) process.exitCode = 1;
}

let lock: Awaited<ReturnType<typeof open>> | undefined;
try {
  lock = await open(lockPath, 'wx');
  await main();
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST')
    console.error('Another day generation run holds the lock.');
  else console.error(error instanceof Error ? error.message : 'Day generation failed.');
  process.exitCode = 1;
} finally {
  if (lock) { await lock.close(); await unlink(lockPath); }
}
