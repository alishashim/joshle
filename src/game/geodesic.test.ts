import { describe, expect, it } from 'vitest';
import { geodesicCoordinates } from './geodesic';

describe('geodesicCoordinates', () => {
  it('keeps a date-line crossing continuous', () => {
    const route = geodesicCoordinates({ lat: 0, lng: 179 }, { lat: 0, lng: -179 });
    expect(route[0]).toEqual([179, 0]);
    expect(route.at(-1)?.[0]).toBeCloseTo(181);
    expect(route.every(([lng, lat], index) => Number.isFinite(lng) && Number.isFinite(lat)
      && (index === 0 || Math.abs(lng - route[index - 1][0]) < 180))).toBe(true);
  });
});
