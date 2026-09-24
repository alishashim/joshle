import { expect, it } from 'vitest';
import { shareResult, shareTripleResult } from './share';

it('formats a spoiler-free result', () => {
  const shared = shareResult(42, 4218, 612.4, 7);
  expect(shared).toBe('JOSHLE #42 🌍\n4,218 / 5,000\n📍 612 km\n🔥 7\njoshle.alishashim.com');
  expect(shared).not.toMatch(/Japan|Fuji|35\.3606|138\.7274/);
});

it('formats a spoiler-free three-round total', () => {
  const shared = shareTripleResult(1, [4732, 3884, 2971], 2);
  expect(shared).toContain('Round 1 4,732 / 5,000');
  expect(shared).toContain('Round 3 2,971 / 5,000');
  expect(shared).toContain('TOTAL 11,587 / 15,000');
  expect(shared).not.toMatch(/easy|medium|hard/i);
  expect(shared).not.toMatch(/Lisbon|Portugal|38\.72509|-9\.1498/);
});
