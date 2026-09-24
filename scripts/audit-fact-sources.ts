import { tripleDays } from '../src/content/tripleDays';

const rounds = tripleDays.flatMap((day) => day.rounds);
const failures: string[] = [];
const inconclusive: string[] = [];
let checked = 0;
let cursor = 0;

async function checkNext() {
  while (cursor < rounds.length) {
    const round = rounds[cursor++];
    const url = round.factSourceUrl;
    if (!url) { failures.push(`${round.id}: missing source`); continue; }
    if (new URL(url).hostname.endsWith('vertexaisearch.cloud.google.com')) {
      failures.push(`${round.id}: search redirect is not a direct source`);
      continue;
    }
    try {
      const response = await fetch(url, {
        method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(12_000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JoshleContentAudit/1.0)' },
      });
      if (response.status === 403 || response.status === 406 || response.status === 429) {
        inconclusive.push(`${round.id}: HTTP ${response.status} ${url}`);
      } else if (response.status >= 400) {
        failures.push(`${round.id}: HTTP ${response.status} ${url}`);
      } else checked++;
    } catch (error) {
      inconclusive.push(`${round.id}: ${error instanceof Error ? error.message : 'request failed'} ${url}`);
    }
  }
}

await Promise.all(Array.from({ length: 8 }, () => checkNext()));
console.log(`Reached ${checked}/${rounds.length} direct fact source links; ${inconclusive.length} inconclusive (blocked or timed out).`);
if (inconclusive.length) console.warn(inconclusive.join('\n'));
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
