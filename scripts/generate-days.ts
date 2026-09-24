import { access, copyFile, mkdir, open, readFile, rename, rm, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { config as loadEnv } from 'dotenv';
import sharp from 'sharp';
import ts from 'typescript';
import type { Difficulty, TripleDay } from '../src/content/types';
import { assertReadyToPublish, planDay } from './dayPlanner';
import type { Location } from './dayPlanner';
import catalog from './location-catalog.json';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const manifestPath = resolve(root, 'src/content/tripleDays.ts');
const stageRoot = resolve(root, 'scripts/.generated-days');
const lockPath = resolve(root, 'scripts/.generate-days.lock');
const model = 'gemini-3.1-flash-image';
const locations = catalog as Location[];

function options(args: string[]) {
  let count = 0, dryRun = false, force = false;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--count') count = Number(args[++index]);
    else if (args[index] === '--dry-run') dryRun = true;
    else if (args[index] === '--force') force = true;
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  if (!Number.isSafeInteger(count) || count < 1 || count > 30) throw new Error('--count must be an integer from 1 to 30.');
  return { count, dryRun, force };
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

function prompt(place: Location, difficulty: Difficulty): string {
  const scene = difficulty === 'easy'
    ? 'Include a recognizable landmark, skyline, monument, natural feature, or strong city clue. Make the place approachable for an ordinary player.'
    : difficulty === 'medium'
      ? 'Use recognizable regional clues from architecture, transit, vegetation, terrain, and infrastructure without an obvious answer giveaway.'
      : 'Use a less-famous neighborhood, smaller-city setting, or peripheral landscape. Make it difficult but fair with several real geographic signals.';
  const size = difficulty === 'easy' ? 'about 2 times' : difficulty === 'medium' ? 'about 2.5 times' : 'at least 3 times';
  const frameHeight = difficulty === 'easy' ? 'roughly 35%' : difficulty === 'medium' ? 'roughly 50%' : 'roughly 65%';
  return `Generate one realistic 3:2 casual smartphone travel photograph for a geography guessing game. Location: ${place.place}, ${place.country} (${place.continent}). Scene direction: ${place.scene}. ${scene} Include useful clues from architecture, terrain, vegetation, climate, roads, vehicles, infrastructure, and everyday local culture where appropriate. Avoid readable place names, flags, maps, airport signs, tourism signs, watermarks, and legible text that reveals the answer. Natural imperfect daylight snapshot; no illustration, studio lighting, surreal details, or glossy advertising look.

The first attached image (josh.jpg) is ONLY a pose and composition reference. The second (josh-cutout.jpg) is the identity and appearance reference for the same adult Josh. Preserve his recognizable face, hair, and pointing pose. Composite him with convincing perspective and shadows. Make Josh ${size} heavier and larger-bodied than in the references and occupy ${frameHeight} of the frame height, presented neutrally and respectfully. Keep at least three place clues visible around him. Never reproduce the White House or any background from the pose reference. Output one finished photograph with Josh already in it.`;
}

function statusOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const value = 'status' in error ? error.status : 'code' in error ? error.code : undefined;
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
}

async function generateImage(ai: GoogleGenAI, place: Location, references: [string, string]): Promise<Buffer> {
  const input = [
    { type: 'image' as const, mime_type: 'image/jpeg', data: references[0] },
    { type: 'image' as const, mime_type: 'image/jpeg', data: references[1] },
    { type: 'text' as const, text: prompt(place, place.difficulty) },
  ];
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await ai.interactions.create({
        model, input, response_format: { type: 'image', aspect_ratio: '3:2', image_size: '1K' },
      });
      if (!response.output_image?.data) throw new Error('No image returned');
      return await sharp(Buffer.from(response.output_image.data, 'base64'))
        .resize(1536, 1024, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 }).toBuffer();
    } catch (error) {
      const status = statusOf(error);
      const transient = status === 429 || (status !== undefined && status >= 500)
        || (error instanceof Error && /timeout|network|ECONNRESET|fetch failed/i.test(error.message));
      if (!transient || attempt === 4) throw error;
      const waitMs = 1000 * 4 ** (attempt - 1);
      console.log(`  Transient API error (${status ?? 'network'}); retrying in ${waitMs / 1000}s.`);
      await new Promise((done) => setTimeout(done, waitMs));
    }
  }
  throw new Error('Image generation failed.');
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
  const { count, dryRun, force } = options(process.argv.slice(2));
  if (new Set(locations.map((place) => place.geonameId)).size !== locations.length) throw new Error('Location catalog has duplicate GeoNames IDs.');
  const days = await readDays();
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
      for (const round of day.rounds) {
        const staged = resolve(stageDir, `${round.difficulty}.webp`);
        const final = resolve(root, 'public', `.${round.image.src}`);
        if (!force && (await exists(staged) || await exists(final))) {
          console.log(`  Reusing ${round.difficulty} image.`);
          skipped++;
          continue;
        }
        const place = locations.find((item) => item.geonameId === round.generation?.geonameId);
        if (!place || place.difficulty !== round.difficulty) throw new Error(`Invalid ${round.difficulty} draft location.`);
        console.log(`  Generating ${round.difficulty}: ${round.answer.label}`);
        const image = await generateImage(ai, place, references);
        await atomicWrite(staged, image);
        console.log(`  Saved ${round.difficulty} (${Math.round(image.length / 1024)} KiB).`);
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
