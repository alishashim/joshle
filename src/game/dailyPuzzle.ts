export const GAME_TIME_ZONE = 'America/New_York';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: GAME_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
});

export function gameDate(now: Date = new Date()): string {
  const parts = dateFormatter.formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function previousDate(date: string): string {
  const day = new Date(`${date}T12:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 1);
  return day.toISOString().slice(0, 10);
}

export function selectDailyPuzzle<T extends { date: string }>(date: string, entries: readonly T[]): { puzzle: T; missingToday: boolean } {
  if (!entries.length) throw new Error('No puzzles are available.');
  const exact = entries.find((puzzle) => puzzle.date === date);
  const earlier = entries.filter((puzzle) => puzzle.date <= date).sort((a, b) => b.date.localeCompare(a.date))[0];
  const first = [...entries].sort((a, b) => a.date.localeCompare(b.date))[0];
  return { puzzle: exact ?? earlier ?? first, missingToday: !exact };
}
