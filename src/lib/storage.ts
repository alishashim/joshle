import type { Coordinates } from '../app/gameState';
import { previousDate } from '../game/dailyPuzzle';

export const STORAGE_KEY = 'joshle.game.official';
export const STORAGE_VERSION = 1;

export type Completion = {
  date: string;
  score: number;
  distanceKm: number;
  guess: Coordinates;
};

export type GameSave = {
  version: 1;
  completed: Record<string, Completion>;
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  tutorialDismissed: boolean;
};

export function emptySave(): GameSave {
  return { version: STORAGE_VERSION, completed: {}, currentStreak: 0, bestStreak: 0, lastCompletedDate: null, tutorialDismissed: false };
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function validDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && !Number.isNaN(Date.parse(`${value}T12:00:00Z`))
    && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
}

function parseCompletion(value: unknown): Completion | null {
  const entry = object(value);
  const guess = object(entry?.guess);
  if (!entry || !guess || !validDate(entry.date)
    || typeof entry.score !== 'number' || !Number.isInteger(entry.score) || entry.score < 0 || entry.score > 5000
    || typeof entry.distanceKm !== 'number' || !Number.isFinite(entry.distanceKm) || entry.distanceKm < 0
    || typeof guess.lat !== 'number' || !Number.isFinite(guess.lat) || Math.abs(guess.lat) > 90
    || typeof guess.lng !== 'number' || !Number.isFinite(guess.lng) || Math.abs(guess.lng) > 180) return null;
  return { date: entry.date, score: entry.score, distanceKm: entry.distanceKm, guess: { lat: guess.lat, lng: guess.lng } };
}

export function parseSave(raw: string | null): GameSave {
  if (!raw) return emptySave();
  try {
    const data = object(JSON.parse(raw));
    if (!data || (data.version !== 1 && data.version !== 0)) return emptySave();
    const save = emptySave();
    // Version 0 stored completions as an array with each item carrying its ID.
    if (data.version === 0 && Array.isArray(data.completed)) {
      for (const item of data.completed) {
        const row = object(item);
        const completion = parseCompletion(item);
        if (row && typeof row.id === 'string' && row.id && completion) save.completed[row.id] = completion;
      }
    } else if (data.version === 1) {
      const entries = object(data.completed);
      if (entries) for (const [id, value] of Object.entries(entries)) {
        const completion = parseCompletion(value);
        if (id && completion) save.completed[id] = completion;
      }
    }
    save.currentStreak = validCount(data.currentStreak);
    save.bestStreak = Math.max(validCount(data.bestStreak), save.currentStreak);
    save.lastCompletedDate = validDate(data.lastCompletedDate) ? data.lastCompletedDate : null;
    save.tutorialDismissed = data.tutorialDismissed === true;
    return save;
  } catch {
    return emptySave();
  }
}

function validCount(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function readSave(): GameSave {
  try { return parseSave(window.localStorage.getItem(STORAGE_KEY)); }
  catch { return emptySave(); }
}

export function writeSave(save: GameSave): void {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }
  catch { /* Private browsing or blocked storage: gameplay remains usable this session. */ }
}

export function activeStreak(save: GameSave, today: string): number {
  return save.lastCompletedDate === today || save.lastCompletedDate === previousDate(today) ? save.currentStreak : 0;
}

export function recordCompletion(save: GameSave, id: string, completion: Completion): GameSave {
  if (save.completed[id]) return save;
  const next = { ...save, completed: { ...save.completed, [id]: completion } };
  if (!save.lastCompletedDate || completion.date > save.lastCompletedDate) {
    next.currentStreak = save.lastCompletedDate === previousDate(completion.date) ? save.currentStreak + 1 : 1;
    next.bestStreak = Math.max(save.bestStreak, next.currentStreak);
    next.lastCompletedDate = completion.date;
  }
  return next;
}
