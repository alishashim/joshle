import { describe, expect, it } from 'vitest';
import { scoreForDistance } from './scoring';

describe('scoreForDistance', () => {
  it('awards 5000 for an exact guess', () => {
    expect(scoreForDistance(0)).toBe(5000);
  });

  it('uses the agreed exponential curve', () => {
    expect(scoreForDistance(2000)).toBe(1839);
    expect(scoreForDistance(4000)).toBe(677);
  });

  it('stays within 0–5000 at the distance extremes', () => {
    expect(scoreForDistance(20015)).toBe(0);
    expect(scoreForDistance(-1)).toBe(0);
    expect(scoreForDistance(Number.NaN)).toBe(0);
  });
});
