import { puzzles } from './puzzles';
import { tripleDays } from './tripleDays';
import type { Difficulty, Puzzle, TripleDay } from './types';
import { selectDailyPuzzle } from '../game/dailyPuzzle';

export type Dataset = 'legacy' | 'triple';
export type DailyContent = {
  id: string;
  number: number;
  date: string;
  rounds: readonly (Puzzle & { difficulty?: Difficulty })[];
  mode: Dataset;
};

export function resolveDataset(value: string | undefined): Dataset {
  if (!value || value === 'triple') return 'triple';
  if (value === 'legacy') return 'legacy';
  throw new Error(`Invalid VITE_JOSHLE_DATASET: ${value}`);
}

export const ACTIVE_DATASET = resolveDataset(import.meta.env.VITE_JOSHLE_DATASET);

export function selectDay(date: string, mode: Dataset,
  legacy: readonly Puzzle[] = puzzles, triple: readonly TripleDay[] = tripleDays,
): { day: DailyContent | null; missingToday: boolean; outOfDays: boolean } {
  if (mode === 'legacy') {
    const { puzzle, missingToday } = selectDailyPuzzle(date, legacy);
    return {
      day: { id: puzzle.id, number: puzzle.number, date: puzzle.date, rounds: [puzzle], mode },
      missingToday,
      outOfDays: legacy.every((entry) => entry.date < date),
    };
  }
  if (!triple.length) return { day: null, missingToday: true, outOfDays: true };
  const { puzzle, missingToday } = selectDailyPuzzle(date, triple);
  return { day: { ...puzzle, mode }, missingToday, outOfDays: triple.every((entry) => entry.date < date) };
}
