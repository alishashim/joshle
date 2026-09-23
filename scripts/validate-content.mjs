import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = readFileSync(resolve(root, 'src/content/puzzles.ts'), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { puzzles } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const errors = [];
const ids = new Set();
const numbers = new Set();
const dates = new Set();
const geonameIds = new Set();
const validDate = (date) => typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
  && !Number.isNaN(Date.parse(`${date}T12:00:00Z`))
  && new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) === date;

if (!Array.isArray(puzzles) || puzzles.length === 0) errors.push('At least one puzzle is required.');
else for (const [index, puzzle] of puzzles.entries()) {
  const name = `Puzzle ${index + 1}`;
  if (typeof puzzle.id !== 'string' || !puzzle.id.trim()) errors.push(`${name}: missing ID`);
  else if (ids.has(puzzle.id)) errors.push(`${name}: duplicate ID ${puzzle.id}`);
  ids.add(puzzle.id);
  if (!Number.isSafeInteger(puzzle.number) || puzzle.number < 1) errors.push(`${name}: invalid puzzle number`);
  else if (numbers.has(puzzle.number)) errors.push(`${name}: duplicate puzzle number ${puzzle.number}`);
  numbers.add(puzzle.number);
  if (!validDate(puzzle.date)) errors.push(`${name}: invalid date`);
  else if (dates.has(puzzle.date)) errors.push(`${name}: duplicate date ${puzzle.date}`);
  dates.add(puzzle.date);

  const { lat, lng } = puzzle.answer ?? {};
  if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180)
    errors.push(`${name}: invalid answer coordinates`);
  const image = puzzle.image ?? {};
  if (typeof image.src !== 'string' || !image.src.startsWith('/') || image.src.startsWith('//')) {
    errors.push(`${name}: image must have a local absolute path`);
  } else {
    const asset = resolve(root, 'public', `.${image.src}`);
    if (relative(resolve(root, 'public'), asset).startsWith('..') || !existsSync(asset))
      errors.push(`${name}: missing local image ${image.src}`);
  }
  if (!image.alt?.trim()) errors.push(`${name}: missing image alt text`);
  if (!['PUBLIC_DOMAIN', 'CC0', 'CC_BY', 'CC_BY_SA', 'GENERATED'].includes(image.license))
    errors.push(`${name}: invalid image license`);
  if (['CC_BY', 'CC_BY_SA'].includes(image.license)
    && (!image.author?.trim() || !image.sourceUrl?.trim() || !image.licenseUrl?.trim() || !image.attributionText?.trim()))
    errors.push(`${name}: CC image requires author, source URL, license URL, and attribution text`);
  if (!image.isPlaceholder && image.license !== 'GENERATED' && (!image.sourceUrl?.trim() || !image.attributionText?.trim()))
    errors.push(`${name}: production photo requires source URL and attribution text`);
  if (image.license === 'GENERATED' && (!image.includesJosh || !image.attributionText?.trim() || !puzzle.generation?.coordinateSourceUrl?.trim()))
    errors.push(`${name}: generated image requires baked-in Josh, credit, and coordinate source`);
  if (puzzle.generation) {
    const { geonameId, difficulty, sizeTier } = puzzle.generation;
    if (!Number.isSafeInteger(geonameId) || geonameIds.has(geonameId))
      errors.push(`${name}: invalid or duplicate GeoNames ID`);
    geonameIds.add(geonameId);
    if (!['easy', 'medium', 'hard'].includes(difficulty) ||
      sizeTier !== (difficulty === 'hard' ? 'enormous' : 'very-large'))
      errors.push(`${name}: size tier must match difficulty`);
  }
}

if (errors.length) {
  console.error(`Content validation failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${puzzles.length} puzzles.`);
}
