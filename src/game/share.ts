export function shareResult(number: number, score: number, distanceKm: number, streak: number): string {
  return [
    `JOSHLE #${number} 🌍`,
    `${score.toLocaleString('en-US')} / 5,000`,
    `📍 ${Math.round(distanceKm).toLocaleString('en-US')} km`,
    `🔥 ${streak}`,
    'joshle.alishashim.com',
  ].join('\n');
}
