import { describe, expect, it, vi } from 'vitest';
import catalog from '../../scripts/location-catalog.json';
import { planDay } from '../../scripts/dayPlanner';
import type { Location } from '../../scripts/dayPlanner';
import type { DailyContent } from '../content/dataset';
import { emptySave, parseSave, readSave, STORAGE_KEY, TRIPLE_STORAGE_KEY, writeSave } from '../lib/storage';
import { scoreForDistance } from './scoring';
import { dailyScores, nextRoundIndex, recordRoundCompletion } from './triple';

const day: DailyContent = { ...planDay([], catalog as Location[]), mode: 'triple' };
const completion = (score: number) => ({ date: day.date, score, distanceKm: 0, guess: { lat: 0, lng: 0 } });

describe('triple-round progress', () => {
  it('persists mid-game without completing the day, then totals at most 15,000', () => {
    const initial = emptySave();
    const afterEasy = recordRoundCompletion(initial, day, 0, completion(5000));
    const refreshed = parseSave(JSON.stringify(afterEasy));
    expect(nextRoundIndex(day, refreshed)).toBe(1);
    expect(dailyScores(day, refreshed)).toBeNull();
    expect(refreshed.currentStreak).toBe(0);
    expect(recordRoundCompletion(refreshed, day, 2, completion(5000))).toBe(refreshed);
    const afterMedium = recordRoundCompletion(refreshed, day, 1, completion(5000));
    const finished = recordRoundCompletion(afterMedium, day, 2, completion(5000));
    expect(dailyScores(day, parseSave(JSON.stringify(finished)))).toEqual([5000, 5000, 5000]);
    expect(dailyScores(day, finished)?.reduce((sum, score) => sum + score, 0)).toBe(15000);
    expect(scoreForDistance(0) * 3).toBe(15000);
    expect(finished.currentStreak).toBe(1);
    expect(nextRoundIndex(day, finished)).toBe(2);
  });

  it('uses a separate key from the official legacy save', () => {
    const data = new Map<string, string>();
    vi.stubGlobal('window', { localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => { data.set(key, value); },
    } });
    try {
      const triple = recordRoundCompletion(emptySave(), day, 0, completion(3500));
      writeSave(triple, TRIPLE_STORAGE_KEY);
      expect(readSave(STORAGE_KEY)).toEqual(emptySave());
      expect(readSave(TRIPLE_STORAGE_KEY).completed[day.rounds[0].id].score).toBe(3500);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
