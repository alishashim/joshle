import type { Difficulty, RoundPuzzle, TripleDay } from '../src/content/types';
import { distanceKm } from '../src/game/distance';

export type Location = {
  geonameId: number; place: string; country: string; countryCode: string;
  continent: string; lat: number; lng: number; difficulty: Difficulty; scene: string;
};

export const FIRST_TRIPLE_DATE = '2026-09-23';
export const DIFFICULTIES: readonly Difficulty[] = ['easy', 'medium', 'hard'];

export function nextDate(date: string): string {
  const value = new Date(`${date}T12:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

export function nextDayIdentity(days: readonly TripleDay[]): { number: number; date: string } {
  if (!days.length) return { number: 1, date: FIRST_TRIPLE_DATE };
  return {
    number: Math.max(...days.map((day) => day.number)) + 1,
    date: nextDate(days.map((day) => day.date).sort().at(-1)!),
  };
}

export function chooseLocations(catalog: readonly Location[], days: readonly TripleDay[]): [Location, Location, Location] {
  const used = new Set(days.flatMap((day) => day.rounds.map((round) => round.generation?.geonameId)));
  const catalogOrder = new Map(catalog.map((place, index) => [place.geonameId, index]));
  const counts = new Map<string, number>();
  for (const day of days) for (const round of day.rounds) {
    const place = catalog.find((item) => item.geonameId === round.generation?.geonameId);
    if (place) counts.set(place.continent, (counts.get(place.continent) ?? 0) + 1);
  }
  const selected: Location[] = [];
  for (const difficulty of DIFFICULTIES) {
    const candidates = catalog.filter((place) => place.difficulty === difficulty && !used.has(place.geonameId)
      && selected.every((prior) => prior.countryCode !== place.countryCode && distanceKm(prior, place) >= 1500));
    const distinct = candidates.filter((place) => selected.every((prior) => prior.continent !== place.continent));
    const pool = distinct.length ? distinct : candidates;
    if (!pool.length) throw new Error(`No suitable unused ${difficulty} locations remain.`);
    pool.sort((a, b) => (counts.get(a.continent) ?? 0) - (counts.get(b.continent) ?? 0)
      || (catalogOrder.get(a.geonameId) ?? 0) - (catalogOrder.get(b.geonameId) ?? 0));
    selected.push(pool[0]);
    used.add(pool[0].geonameId);
    counts.set(pool[0].continent, (counts.get(pool[0].continent) ?? 0) + 1);
  }
  return selected as [Location, Location, Location];
}

function roundFor(dayId: string, number: number, date: string, place: Location): RoundPuzzle {
  const difficulty = place.difficulty;
  return {
    id: `${dayId}-${difficulty}`, number, date, difficulty, maxScore: 5000,
    image: {
      src: `/images/puzzles/t_${String(number).padStart(4, '0')}_${difficulty}.webp`,
      alt: 'Josh points through a travel scene with architecture and landscape clues.',
      author: 'Joshle with Google Gemini', license: 'GENERATED',
      attributionText: 'AI-generated for Joshle with Google Gemini', includesJosh: true,
    },
    answer: { lat: place.lat, lng: place.lng, label: `${place.place}, ${place.country}`, countryCode: place.countryCode },
    fact: `${place.place} is in ${place.country}. The generated scene represents the area rather than the exact coordinate.`,
    generation: {
      geonameId: place.geonameId,
      coordinateSourceUrl: `https://www.geonames.org/${place.geonameId}/`,
      difficulty, sizeTier: difficulty === 'hard' ? 'enormous' : 'very-large',
    },
  };
}

export function planDay(days: readonly TripleDay[], catalog: readonly Location[]): TripleDay {
  const { number, date } = nextDayIdentity(days);
  const id = `joshle-triple-${String(number).padStart(4, '0')}`;
  const places = chooseLocations(catalog, days);
  return { id, number, date, rounds: places.map((place) => roundFor(id, number, date, place)) as TripleDay['rounds'] };
}

export function assertReadyToPublish(day: TripleDay, validImages: readonly boolean[]): void {
  const countries = new Set(day.rounds.map((round) => round.answer.countryCode));
  const geonames = new Set(day.rounds.map((round) => round.generation?.geonameId));
  if (day.rounds.length !== 3 || validImages.length !== 3 || !validImages.every(Boolean)
    || countries.size !== 3 || geonames.size !== 3
    || day.rounds.some((round, index) => round.difficulty !== DIFFICULTIES[index]
      || round.id !== `${day.id}-${DIFFICULTIES[index]}`
      || round.maxScore !== 5000
      || round.date !== day.date || round.number !== day.number
      || !Number.isFinite(round.answer.lat) || Math.abs(round.answer.lat) > 90
      || !Number.isFinite(round.answer.lng) || Math.abs(round.answer.lng) > 180
      || !round.answer.label || !round.answer.countryCode || !round.fact
      || round.image.src !== `/images/puzzles/t_${String(day.number).padStart(4, '0')}_${DIFFICULTIES[index]}.webp`
      || !round.image.alt || round.image.license !== 'GENERATED'
      || !round.image.includesJosh || !round.image.attributionText
      || !Number.isSafeInteger(round.generation?.geonameId)
      || !round.generation?.coordinateSourceUrl
      || round.generation.difficulty !== DIFFICULTIES[index]
      || round.generation.sizeTier !== (round.difficulty === 'hard' ? 'enormous' : 'very-large')))
    throw new Error('A complete day needs three ordered, valid rounds and images.');
}
