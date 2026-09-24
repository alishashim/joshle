import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = readFileSync(resolve(root, 'src/content/tripleDays.ts'), 'utf8');
const transpiled = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
if (transpiled.diagnostics?.length) throw new Error('Triple-day manifest has a syntax error.');
const { tripleDays } = await import(`data:text/javascript;base64,${Buffer.from(transpiled.outputText).toString('base64')}`);
const errors = [];
const ids = new Set();
const dates = new Set();
const numbers = new Set();
const geonames = new Set();
const difficulties = ['easy', 'medium', 'hard'];
const validDate = (date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
  && !Number.isNaN(Date.parse(`${date}T12:00:00Z`))
  && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;

if (!Array.isArray(tripleDays)) errors.push('Triple days must be an array.');
else for (const day of tripleDays) {
  if (!day || typeof day !== 'object') { errors.push('Invalid triple day.'); continue; }
  if (!day.id?.startsWith('joshle-triple-') || ids.has(day.id)) errors.push(`Invalid or duplicate day ID ${day.id}`);
  ids.add(day.id);
  if (!Number.isSafeInteger(day.number) || day.number < 1 || numbers.has(day.number)) errors.push(`Invalid or duplicate day number ${day.number}`);
  numbers.add(day.number);
  if (!validDate(day.date) || dates.has(day.date)) errors.push(`Invalid or duplicate day date ${day.date}`);
  dates.add(day.date);
  if (!Array.isArray(day.rounds) || day.rounds.length !== 3) { errors.push(`${day.id}: exactly three rounds required`); continue; }
  for (const [index, round] of day.rounds.entries()) {
    const name = `${day.id} ${difficulties[index]}`;
    if (!round || round.difficulty !== difficulties[index] || round.generation?.difficulty !== difficulties[index] || round.maxScore !== 5000) errors.push(`${name}: wrong round order, difficulty, or max score`);
    if (round?.id !== `${day.id}-${difficulties[index]}` || ids.has(round?.id)) errors.push(`${name}: invalid or duplicate round ID`);
    ids.add(round?.id);
    if (round?.date !== day.date || round?.number !== day.number) errors.push(`${name}: date/number mismatch`);
    if (!Number.isFinite(round?.answer?.lat) || Math.abs(round.answer.lat) > 90 || !Number.isFinite(round?.answer?.lng) || Math.abs(round.answer.lng) > 180) errors.push(`${name}: invalid coordinates`);
    if (!round?.answer?.label || !round.answer.countryCode || !round.fact) errors.push(`${name}: missing answer metadata`);
    const image = round?.image;
    if (typeof image?.src !== 'string' || !image.src.startsWith('/') || image.src.startsWith('//')) errors.push(`${name}: invalid local image path`);
    else {
      const asset = resolve(root, 'public', `.${image.src}`);
      if (relative(resolve(root, 'public'), asset).startsWith('..') || !existsSync(asset)) errors.push(`${name}: missing ${image.src}`);
    }
    if (!image?.alt || image.license !== 'GENERATED' || !image.includesJosh || !image.attributionText) errors.push(`${name}: missing generated image metadata`);
    if (!Number.isSafeInteger(round?.generation?.geonameId) || geonames.has(round.generation.geonameId) || !round.generation.coordinateSourceUrl) errors.push(`${name}: invalid or duplicate GeoNames metadata`);
    geonames.add(round?.generation?.geonameId);
  }
}

if (errors.length) {
  console.error(`Triple content validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else console.log(`Validated ${tripleDays.length} complete triple days.`);
