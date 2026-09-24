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
    `Easy ${scores[0].toLocaleString('en-US')} / 5,000`,
    `Medium ${scores[1].toLocaleString('en-US')} / 5,000`,
    `Hard ${scores[2].toLocaleString('en-US')} / 5,000`,
    `TOTAL ${total.toLocaleString('en-US')} / 15,000`,
    `🔥 ${streak}`,
    'joshle.alishashim.com',
  ].join('\n');
}
