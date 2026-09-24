export function shareResult(number: number, score: number, distanceKm: number, streak: number): string {
  return [
    `JOSHLE #${number} 🌍`,
    `${score.toLocaleString('en-US')} / 5,000`,
    `📍 ${Math.round(distanceKm).toLocaleString('en-US')} km`,
    `🔥 ${streak}`,
    'joshle.alishashim.com',
  ].join('\n');
}

export function shareTripleResult(number: number, scores: readonly number[], streak: number): string {
  if (scores.length !== 3) throw new Error('A triple result requires three scores.');
  const total = scores.reduce((sum, score) => sum + score, 0);
  return [
    `JOSHLE #${number} 🌍`,
    `Round 1 ${scores[0].toLocaleString('en-US')} / 5,000`,
    `Round 2 ${scores[1].toLocaleString('en-US')} / 5,000`,
    `Round 3 ${scores[2].toLocaleString('en-US')} / 5,000`,
    `TOTAL ${total.toLocaleString('en-US')} / 15,000`,
    `🔥 ${streak}`,
    'joshle.alishashim.com',
  ].join('\n');
}
