import { expect, it } from 'vitest';
import { shareResult } from './share';

it('formats a spoiler-free result', () => {
  const shared = shareResult(42, 4218, 612.4, 7);
  expect(shared).toBe('JOSHLE #42 🌍\n4,218 / 5,000\n📍 612 km\n🔥 7\njoshle.alishashim.com');
  expect(shared).not.toMatch(/Japan|Fuji|35\.3606|138\.7274/);
});
