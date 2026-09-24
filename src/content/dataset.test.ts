import { describe, expect, it } from 'vitest';
import catalog from '../../scripts/location-catalog.json';
import { planDay } from '../../scripts/dayPlanner';
import type { Location } from '../../scripts/dayPlanner';
import { puzzles } from './puzzles';
import { resolveDataset, selectDay } from './dataset';

describe('content dataset switch', () => {
  const tripleDay = planDay([], catalog as Location[]);

  it('defaults to triple and rejects invalid modes', () => {
    expect(resolveDataset(undefined)).toBe('triple');
    expect(resolveDataset('legacy')).toBe('legacy');
    expect(resolveDataset('triple')).toBe('triple');
    expect(() => resolveDataset('unknown')).toThrow();
  });

  it('keeps legacy and triple entries on the same date isolated', () => {
    const legacy = selectDay('2026-09-23', 'legacy', puzzles, [tripleDay]);
    const triple = selectDay('2026-09-23', 'triple', puzzles, [tripleDay]);
    expect(legacy.day?.rounds[0].answer.label).toBe('Lisbon, Portugal');
    expect(legacy.day?.rounds).toHaveLength(1);
    expect(triple.day?.rounds).toHaveLength(3);
    expect(triple.day?.id).not.toBe(legacy.day?.id);
    expect(selectDay('2026-10-02', 'legacy', puzzles, [tripleDay]).day?.number).toBe(10);
  });
});
