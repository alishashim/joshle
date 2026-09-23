export function scoreForDistance(distanceKm: number): number {
  if (!Number.isFinite(distanceKm) || distanceKm < 0) return 0;
  return Math.max(0, Math.min(5000, Math.round(5000 * Math.exp(-distanceKm / 2000))));
}
