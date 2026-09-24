import { describe, expect, it } from 'vitest';
import catalog from './location-catalog.json';
import { tripleDays } from '../src/content/tripleDays';
import { assertReadyToPublish, nextDayIdentity, planDay } from './dayPlanner';
import type { Location } from './dayPlanner';

const locations = catalog as Location[];

describe('triple-day planning', () => {
  it('starts on September 23 and plans exactly three diverse, ordered rounds', () => {
    const day = planDay([], locations);
    expect(day.date).toBe('2026-09-23');
    expect(day.number).toBe(1);
    expect(day.rounds.map((round) => round.difficulty)).toEqual(['easy', 'medium', 'hard']);
    expect(day.rounds).toHaveLength(3);
    expect(new Set(day.rounds.map((round) => round.answer.countryCode)).size).toBe(3);
    expect(nextDayIdentity([day])).toEqual({ number: 2, date: '2026-09-24' });
    expect(nextDayIdentity(tripleDays)).toEqual({ number: 5, date: '2026-09-27' });
  });

  it('requires all three valid images before a day can enter the manifest', () => {
    const day = planDay([], locations);
    expect(() => assertReadyToPublish(day, [true, true, false])).toThrow();
    expect(() => assertReadyToPublish({ ...day, rounds: day.rounds.slice(0, 2) as typeof day.rounds }, [true, true])).toThrow();
    expect(() => assertReadyToPublish(day, [true, true, true])).not.toThrow();
  });
});
