import * as THREE from "three";
import { LAND_LATLON } from "./land-dots";

/** Convert latitude/longitude (degrees) to a point on a sphere of `radius`. */
export function latLonToVector3(
  lat: number,
  lon: number,
  radius = 1,
  target = new THREE.Vector3(),
): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/**
 * Land dot positions on a sphere, decoded from the pregenerated Natural Earth
 * sample table. Returns a flat Float32Array of xyz triples.
 */
export function landPointCloud(radius = 1): Float32Array {
  const count = LAND_LATLON.length / 2;
  const positions = new Float32Array(count * 3);
  const v = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    const lat = LAND_LATLON[i * 2] / 100;
    const lon = LAND_LATLON[i * 2 + 1] / 100;
    latLonToVector3(lat, lon, radius, v);
    positions[i * 3] = v.x;
    positions[i * 3 + 1] = v.y;
    positions[i * 3 + 2] = v.z;
  }

  return positions;
}

export type City = { name: string; lat: number; lon: number };

export const CITIES: City[] = [
  { name: "New York", lat: 40.71, lon: -74.01 },
  { name: "London", lat: 51.51, lon: -0.13 },
  { name: "Dubai", lat: 25.2, lon: 55.27 },
  { name: "Singapore", lat: 1.35, lon: 103.82 },
  { name: "Tokyo", lat: 35.68, lon: 139.69 },
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "Lagos", lat: 6.52, lon: 3.38 },
  { name: "Sydney", lat: -33.87, lon: 151.21 },
  { name: "Mumbai", lat: 19.08, lon: 72.88 },
  { name: "Frankfurt", lat: 50.11, lon: 8.68 },
  { name: "San Francisco", lat: 37.77, lon: -122.42 },
  { name: "Nairobi", lat: -1.29, lon: 36.82 },
];

/** Index pairs into CITIES that get a flight arc. */
export const ROUTES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [0, 10], [10, 4],
  [1, 6], [6, 11], [2, 8], [8, 3], [5, 1], [3, 7], [9, 2], [0, 5],
];

/**
 * Great-circle-ish arc between two surface points, bowed outward. Longer hops
 * rise higher, which is what makes a route map read as a route map.
 */
export function arcCurve(a: THREE.Vector3, b: THREE.Vector3, radius = 1): THREE.QuadraticBezierCurve3 {
  const distance = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(radius + distance * 0.32);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}
