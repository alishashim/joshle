import { describe, expect, it } from 'vitest';
import { distanceKm } from './distance';

describe('distanceKm', () => {
  it('returns zero for the same point', () => {
    expect(distanceKm({ lat: 35.3606, lng: 138.7274 }, { lat: 35.3606, lng: 138.7274 })).toBe(0);
  });

  it('matches a known great-circle distance', () => {
    const newYork = { lat: 40.7128, lng: -74.006 };
    const london = { lat: 51.5074, lng: -0.1278 };
    expect(distanceKm(newYork, london)).toBeCloseTo(5570.2, 0);
    expect(distanceKm(london, newYork)).toBeCloseTo(5570.2, 0);
  });

  it('takes the short route across the date line', () => {
    expect(distanceKm({ lat: 0, lng: 179 }, { lat: 0, lng: -179 })).toBeCloseTo(222.39, 1);
  });
});
