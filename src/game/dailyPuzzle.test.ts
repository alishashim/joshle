import { describe, expect, it } from 'vitest';
import { puzzles } from '../content/puzzles';
import { gameDate, selectDailyPuzzle } from './dailyPuzzle';

describe('canonical daily puzzle', () => {
  it('rolls over at New York midnight, including daylight saving time', () => {
    expect(gameDate(new Date('2026-09-24T03:59:59Z'))).toBe('2026-09-23');
    expect(gameDate(new Date('2026-09-24T04:00:00Z'))).toBe('2026-09-24');
    expect(gameDate(new Date('2026-01-02T04:59:59Z'))).toBe('2026-01-01');
    expect(gameDate(new Date('2026-01-02T05:00:00Z'))).toBe('2026-01-02');
  });

  it('selects dated puzzles and falls back to the latest authored date', () => {
    expect(selectDailyPuzzle('2026-09-23', puzzles)).toEqual({ puzzle: puzzles[0], missingToday: false });
    expect(selectDailyPuzzle('2026-09-25', puzzles)).toEqual({ puzzle: puzzles[2], missingToday: false });
    expect(selectDailyPuzzle('2026-10-02', puzzles)).toEqual({ puzzle: puzzles[9], missingToday: false });
    expect(selectDailyPuzzle('2026-10-03', puzzles).puzzle.number).toBe(11);
    expect(selectDailyPuzzle('2026-09-22', puzzles)).toEqual({ puzzle: puzzles[0], missingToday: true });
    expect(selectDailyPuzzle('9999-12-31', puzzles)).toEqual({ puzzle: puzzles.at(-1), missingToday: true });
    expect(new Set(puzzles.map(({ number }) => number)).size).toBe(puzzles.length);
  });
});
