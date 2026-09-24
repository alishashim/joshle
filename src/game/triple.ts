import type { DailyContent } from '../content/dataset';
import type { Completion, GameSave } from '../lib/storage';
import { previousDate } from './dailyPuzzle';

export function nextRoundIndex(day: DailyContent, save: GameSave): number {
  const first = day.rounds.findIndex((round) => !save.completed[round.id]);
  return first < 0 ? day.rounds.length - 1 : first;
}

export function dailyScores(day: DailyContent, save: GameSave): number[] | null {
  const scores = day.rounds.map((round) => save.completed[round.id]?.score);
  return scores.every((score): score is number => score !== undefined) ? scores as number[] : null;
}

export function recordRoundCompletion(save: GameSave, day: DailyContent, roundIndex: number, completion: Completion): GameSave {
  const round = day.rounds[roundIndex];
  if (!round || save.completed[round.id] || completion.date !== day.date) return save;
  if (day.rounds.slice(0, roundIndex).some((earlier) => !save.completed[earlier.id])) return save;
  const next = { ...save, completed: { ...save.completed, [round.id]: completion }, tutorialDismissed: true };
  if (dailyScores(day, next) && (!next.lastCompletedDate || day.date > next.lastCompletedDate)) {
    next.currentStreak = next.lastCompletedDate === previousDate(day.date) ? next.currentStreak + 1 : 1;
    next.bestStreak = Math.max(next.bestStreak, next.currentStreak);
    next.lastCompletedDate = day.date;
  }
  return next;
}
