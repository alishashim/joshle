import type { Coordinates } from '../app/gameState';

const EARTH_RADIUS_KM = 6371.0088;
const toRadians = (degrees: number) => degrees * Math.PI / 180;

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const haversine = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)));
}
