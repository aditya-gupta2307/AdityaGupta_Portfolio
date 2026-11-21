import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const cache = new Map<string, THREE.BufferGeometry>();

/**
 * Rounded box with the six BoxGeometry material groups intact
 * (+x, −x, +y, −y, +z, −z), memoised by size so repeats share one buffer.
 */
export function roundedBox(w: number, h: number, d: number, radius: number, segments = 3) {
  const key = `rb:${w}:${h}:${d}:${radius}:${segments}`;
  let g = cache.get(key);
  if (!g) {
    g = new RoundedBoxGeometry(w, h, d, segments, Math.min(radius, Math.min(w, h, d) / 2 - 1e-5));
    cache.set(key, g);
  }
  return g;
}

/**
 * Keycap: a rounded box whose top is narrower than its base, like a
 * sculpted cap, with the base sitting at y = 0.
 */
export function keycap(widthU: number, unit: number, height: number) {
  const key = `kc:${widthU}:${unit}:${height}`;
  let g = cache.get(key);
  if (g) return g;
  const gap = unit * 0.09;
  const w = widthU * unit - gap;
  const d = unit - gap;
  const box = new RoundedBoxGeometry(w, height, d, 3, Math.min(0.0016, height / 2.2));
  const pos = box.attributes.position as THREE.BufferAttribute;
  const taper = unit * 0.07;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = (y + height / 2) / height; // 0 at base, 1 at top
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const sx = (w / 2 - taper * t) / (w / 2);
    const sz = (d / 2 - taper * t) / (d / 2);
    pos.setXYZ(i, x * sx, y + height / 2, z * sz - taper * 0.25 * t);
  }
  pos.needsUpdate = true;
  box.computeVertexNormals();
  cache.set(key, box);
  return box;
}

/** Revolve a 2D profile (x = radius, y = height) into a solid. */
export function lathe(points: [number, number][], segments = 48) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  );
}

/** Tube along a list of points, smoothed with a Catmull-Rom curve. */
export function tube(points: [number, number, number][], radius: number, tubular = 32, radial = 10) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)));
  return new THREE.TubeGeometry(curve, tubular, radius, radial, false);
}
