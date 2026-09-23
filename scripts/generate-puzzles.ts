import { readFile, writeFile, rename, unlink, open, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { config as loadEnv } from 'dotenv';
import sharp from 'sharp';
import ts from 'typescript';
import type { Puzzle } from '../src/content/types';
import catalog from './location-catalog.json';

type Difficulty = 'easy' | 'medium' | 'hard';
type Location = {
  geonameId: number; place: string; country: string; countryCode: string;
  continent: string; lat: number; lng: number; difficulty: Difficulty; scene: string;
};
type Ledger = { records: Puzzle[] };

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const puzzleFile = resolve(root, 'src/content/puzzles.ts');
const ledgerFile = resolve(root, 'scripts/generated-puzzles-state.json');
const lockFile = resolve(root, 'scripts/.generate-puzzles.lock');
const model = 'gemini-3.1-flash-image';
const locations = catalog as Location[];

function validateCatalog() {
  if (locations.length < 100 || new Set(locations.map((place) => place.geonameId)).size !== locations.length)
    throw new Error('Location catalog needs at least 100 unique GeoNames IDs.');
  for (const place of locations) {
    if (!Number.isFinite(place.lat) || Math.abs(place.lat) > 90 || !Number.isFinite(place.lng) || Math.abs(place.lng) > 180 ||
      !['easy', 'medium', 'hard'].includes(place.difficulty) || !place.place || !place.country)
      throw new Error('Location catalog contains an invalid place.');
  }
}

function options(args: string[]) {
  let count = 0;
  let dryRun = false;
  let force = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count') count = Number(args[++i]);
    else if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--force') force = true;
    else throw new Error(`Unknown option: ${args[i]}`);
  }
  if (!Number.isSafeInteger(count) || count < 1 || count > 100)
    throw new Error('--count must be an integer from 1 to 100.');
  return { count, dryRun, force };
}

async function exists(path: string) {
  try { await access(path); return true; } catch { return false; }
}

async function readPuzzles(): Promise<Puzzle[]> {
  const source = await readFile(puzzleFile, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
  return module.puzzles as Puzzle[];
}

async function appendPuzzle(puzzle: Puzzle) {
  const source = await readFile(puzzleFile, 'utf8');
  const end = source.lastIndexOf('\n];');
  if (end < 0) throw new Error('Could not find the end of the existing puzzle list.');
  const entry = JSON.stringify(puzzle, null, 2).split('\n').map((line) => `  ${line}`).join('\n');
  await atomicWrite(puzzleFile, `${source.slice(0, end)}\n${entry},${source.slice(end)}`);
}

async function atomicWrite(path: string, contents: string | Buffer) {
  const temporary = `${path}.tmp`;
  await writeFile(temporary, contents);
  await rename(temporary, path);
}

async function readLedger(): Promise<Ledger> {
  if (!(await exists(ledgerFile))) return { records: [] };
  const data: unknown = JSON.parse(await readFile(ledgerFile, 'utf8'));
  if (!data || typeof data !== 'object' || !('records' in data) || !Array.isArray(data.records))
    throw new Error('Generated puzzle ledger is invalid.');
  return data as Ledger;
}

function nextDay(date: string) {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function target(number: number, date: string, place: Location): Puzzle {
  const id = `joshle-${String(number).padStart(4, '0')}`;
  const hard = place.difficulty === 'hard';
  return {
    id, number, date,
    image: {
      src: `/images/puzzles/p_${String(number).padStart(4, '0')}.webp`,
      alt: 'Josh pointing in a casual travel scene with architecture and landscape clues.',
      author: 'Joshle with Google Gemini',
      license: 'GENERATED',
      attributionText: 'AI-generated for Joshle with Google Gemini',
      includesJosh: true,
    },
    answer: { lat: place.lat, lng: place.lng, label: `${place.place}, ${place.country}`, countryCode: place.countryCode },
    fact: `${place.place} is in ${place.country}. The clue is a generated, representative scene rather than a photo of the exact coordinate.`,
    generation: {
      geonameId: place.geonameId,
      coordinateSourceUrl: `https://www.geonames.org/${place.geonameId}/`,
      difficulty: place.difficulty,
      sizeTier: hard ? 'enormous' : 'very-large',
    },
  };
}

function prompt(place: Location) {
  const hard = place.difficulty === 'hard';
  return `Generate one realistic 3:2 casual smartphone travel photograph for a geography guessing game. Location: ${place.place}, ${place.country} (${place.continent}). Scene direction: ${place.scene}. Make it plausible for that specific place, with at least three useful geographic clues from architecture, terrain, vegetation, climate, roads, vehicles, infrastructure, street furniture, or everyday local visual culture. Choose an ordinary public setting, not a famous landmark. Avoid readable place names, flags, maps, airport signs, tourism signs, watermarks, and legible text that reveals the answer. Natural imperfect snapshot composition and daylight; no illustration, studio lighting, surreal details, or glossy advertising look.

The first attached image (josh.jpg) is ONLY a pose and composition reference. The second (josh-cutout.jpg) is the identity and appearance reference for the same adult Josh. Preserve his recognizable face and hair and a natural version of his pointing pose. Place him into the new scene with convincing perspective, shadows, and smartphone-camera texture. Make Josh approximately 2–3 times heavier and larger-bodied than in the references, presented neutrally and respectfully. ${hard ? 'Enormous Josh: he should occupy about 45–55% of the image height while leaving several location clues visible.' : 'Very large Josh: he should occupy about 30–40% of the image height while leaving the setting clearly visible.'} Never reproduce the White House or any part of its background from the pose reference. Output one finished photograph with Josh already in it.`;
}

function statusOf(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const value = 'status' in error ? error.status : 'code' in error ? error.code : undefined;
  const number = Number(value);
  return Number.isInteger(number) ? number : undefined;
}

async function generateImage(ai: GoogleGenAI, place: Location, references: [string, string]) {
  const input = [
    { type: 'image' as const, mime_type: 'image/jpeg', data: references[0] },
    { type: 'image' as const, mime_type: 'image/jpeg', data: references[1] },
    { type: 'text' as const, text: prompt(place) },
  ];
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await ai.interactions.create({
        model, input, response_format: { type: 'image', aspect_ratio: '3:2', image_size: '1K' },
      });
      if (!response.output_image?.data) throw new Error('No image returned');
      const bytes = Buffer.from(response.output_image.data, 'base64');
      return await sharp(bytes).resize(1536, 1024, { fit: 'cover', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 }).toBuffer();
    } catch (error) {
      const status = statusOf(error);
      const transient = status === 429 || (status !== undefined && status >= 500) ||
        (error instanceof Error && /timeout|network|ECONNRESET|fetch failed/i.test(error.message));
      if (!transient || attempt === 4) throw error;
      const waitMs = 1000 * 4 ** (attempt - 1);
      console.log(`  Transient API error (${status ?? 'network'}); retrying in ${waitMs / 1000}s.`);
      await new Promise((done) => setTimeout(done, waitMs));
    }
  }
  throw new Error('Image generation failed.');
}

async function main() {
  const { count, dryRun, force } = options(process.argv.slice(2));
  validateCatalog();
  let puzzles = await readPuzzles();
  const ledger = await readLedger();
  if (!dryRun) {
    for (const puzzle of ledger.records) {
      if (puzzles.some((entry) => entry.id === puzzle.id)) continue;
      if (!(await exists(resolve(root, 'public', `.${puzzle.image.src}`))))
        throw new Error(`Ledger image is missing for ${puzzle.id}; repair it before continuing.`);
      await appendPuzzle(puzzle);
      console.log(`Recovered ${puzzle.id} from the generation ledger.`);
    }
    puzzles = await readPuzzles();
  }
  const used = new Set(puzzles.map((entry) => entry.generation?.geonameId).filter((id) => id !== undefined));
  const available = locations.filter((place) => !used.has(place.geonameId));
  if (count > available.length) throw new Error(`Only ${available.length} unused catalog locations remain.`);
  let number = Math.max(...puzzles.map((entry) => entry.number)) + 1;
  let date = nextDay(puzzles.map((entry) => entry.date).sort().at(-1)!);
  if (dryRun) {
    for (const [index, place] of available.slice(0, count).entries()) {
      const puzzle = target(number++, date, place);
      console.log(`[${index + 1}/${count}] ${puzzle.id} ${date} · ${puzzle.answer.label} · ${place.difficulty} · ${puzzle.image.src}`);
      date = nextDay(date);
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
  for (const [index, place] of available.slice(0, count).entries()) {
    const puzzle = target(number, date, place);
    const imagePath = resolve(root, 'public', `.${puzzle.image.src}`);
    console.log(`[${index + 1}/${count}] ${puzzle.id} ${date} · ${puzzle.answer.label} · ${place.difficulty}`);
    if (await exists(imagePath) && !force) {
      console.log(`  Skipped: ${puzzle.image.src} already exists without a published record (use --force to replace it).`);
      skipped++;
      continue;
    }
    try {
      const image = await generateImage(ai, place, references);
      await atomicWrite(imagePath, image);
      ledger.records.push(puzzle);
      await atomicWrite(ledgerFile, `${JSON.stringify(ledger, null, 2)}\n`);
      await appendPuzzle(puzzle);
      console.log(`  Saved ${puzzle.image.src} (${Math.round(image.length / 1024)} KiB).`);
      succeeded++;
      number++;
      date = nextDay(date);
    } catch (error) {
      const status = statusOf(error);
      console.error(`  Failed: ${status === 402 ? 'API HTTP 402 (enable billing for Gemini image generation)' : status ? `API HTTP ${status}` : error instanceof Error && error.message === 'No image returned' ? 'no image returned' : 'image generation or file write error'}.`);
      failed++;
    }
  }
  console.log(`Summary: succeeded ${succeeded}; failed ${failed}; skipped ${skipped}.`);
  if (failed || skipped) process.exitCode = 1;
}

let lock: Awaited<ReturnType<typeof open>> | undefined;
try {
  lock = await open(lockFile, 'wx');
  await main();
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST')
    console.error('Another puzzle generation run holds the lock.');
  else console.error(error instanceof Error ? error.message : 'Puzzle generation failed.');
  process.exitCode = 1;
} finally {
  if (lock) { await lock.close(); await unlink(lockFile); }
}
