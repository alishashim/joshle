import { describe, expect, it, vi } from 'vitest';
import { activeStreak, emptySave, parseSave, readSave, recordCompletion, writeSave } from './storage';

const completion = (date: string) => ({ date, score: 4218, distanceKm: 612, guess: { lat: 12, lng: -22 } });

describe('game save', () => {
  it('handles malformed and unknown saved data', () => {
    expect(parseSave('{')).toEqual(emptySave());
    expect(parseSave('{"version":99}')).toEqual(emptySave());
    expect(parseSave(JSON.stringify({ version: 1, completed: { bad: { ...completion('2026-09-22'), score: 9000 } } })).completed).toEqual({});
  });

  it('keeps the game usable when browser storage is blocked', () => {
    vi.stubGlobal('window', { localStorage: {
      getItem: () => { throw new Error('Storage blocked'); },
      setItem: () => { throw new Error('Storage blocked'); },
    } });
    try {
      expect(readSave()).toEqual(emptySave());
      expect(() => writeSave(emptySave())).not.toThrow();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('migrates version 0 array completions and retains preferences', () => {
    const old = { version: 0, completed: [{ id: 'p1', ...completion('2026-09-22') }],
      currentStreak: 2, bestStreak: 3, lastCompletedDate: '2026-09-22', tutorialDismissed: true };
    expect(parseSave(JSON.stringify(old))).toEqual({ version: 1, completed: { p1: completion('2026-09-22') },
      currentStreak: 2, bestStreak: 3, lastCompletedDate: '2026-09-22', tutorialDismissed: true });
  });

  it('increments adjacent days, ignores repeated completions, and resets after a gap', () => {
    const first = recordCompletion(emptySave(), 'p1', completion('2026-09-22'));
    const second = recordCompletion(first, 'p2', completion('2026-09-23'));
    expect(second.currentStreak).toBe(2);
    expect(recordCompletion(second, 'p2', completion('2026-09-23'))).toBe(second);
    expect(activeStreak(second, '2026-09-24')).toBe(2);
    expect(activeStreak(second, '2026-09-25')).toBe(0);
    const afterGap = recordCompletion(second, 'p3', completion('2026-09-25'));
    expect(afterGap.currentStreak).toBe(1);
    expect(afterGap.bestStreak).toBe(2);
  });
});
