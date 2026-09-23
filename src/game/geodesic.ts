import type { Coordinates } from '../app/gameState';

const toRadians = (degrees: number) => degrees * Math.PI / 180;
const toDegrees = (radians: number) => radians * 180 / Math.PI;

function unitVector(point: Coordinates): [number, number, number] {
  const lat = toRadians(point.lat);
  const lng = toRadians(point.lng);
  return [Math.cos(lat) * Math.cos(lng), Math.cos(lat) * Math.sin(lng), Math.sin(lat)];
}

// Spherical interpolation follows the shortest great-circle route. Longitudes are
// unwrapped so a route crossing the date line does not draw across the whole map.
export function geodesicCoordinates(start: Coordinates, end: Coordinates): [number, number][] {
  const a = unitVector(start);
  const b = unitVector(end);
  const dot = Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const angle = Math.acos(dot);
  const count = Math.max(2, Math.ceil(toDegrees(angle) / 2));
  const points: [number, number][] = [];
  let previousLng = start.lng;

  for (let index = 0; index <= count; index += 1) {
    const t = index / count;
    let lng: number;
    let lat: number;
    if (angle < 1e-8 || Math.abs(Math.sin(angle)) < 1e-8) {
      // Near-identical and antipodal points have an ambiguous great-circle plane.
      lng = start.lng + (((end.lng - start.lng + 540) % 360) - 180) * t;
      lat = start.lat + (end.lat - start.lat) * t;
    } else {
      const startWeight = Math.sin((1 - t) * angle) / Math.sin(angle);
      const endWeight = Math.sin(t * angle) / Math.sin(angle);
      const x = startWeight * a[0] + endWeight * b[0];
      const y = startWeight * a[1] + endWeight * b[1];
      const z = startWeight * a[2] + endWeight * b[2];
      lng = toDegrees(Math.atan2(y, x));
      lat = toDegrees(Math.atan2(z, Math.hypot(x, y)));
    }
    while (lng - previousLng > 180) lng -= 360;
    while (lng - previousLng < -180) lng += 360;
    points.push([lng, lat]);
    previousLng = lng;
  }
  return points;
}
