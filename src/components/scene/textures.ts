import * as THREE from 'three';

/** Deterministic value noise, so the generated textures look the same every load. */
function makeNoise(seed = 1) {
  const perm = new Uint8Array(512);
  let s = seed >>> 0;
  const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = (h: number) => (h / 255) * 2 - 1;
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x) & 255;
    const yi = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const a = grad(perm[perm[xi] + yi]);
    const b = grad(perm[perm[xi + 1] + yi]);
    const c = grad(perm[perm[xi] + yi + 1]);
    const d = grad(perm[perm[xi + 1] + yi + 1]);
    const u = fade(xf);
    const v = fade(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function canvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function finish(c: HTMLCanvasElement, srgb = true, repeat?: [number, number]) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.needsUpdate = true;
  return t;
}

/** Smoked-oak desktop: colour map plus a matching roughness map. */
export function woodTextures(size = 1024) {
  const noise = makeNoise(7);
  const w = size;
  const h = size / 2;
  const [c, g] = canvas(w, h);
  const [rc, rg] = canvas(w, h);
  const img = g.createImageData(w, h);
  const rimg = rg.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const nx = x / w;
      const ny = y / h;
      // Long grain along x, warped by low-frequency noise.
      const warp = noise(nx * 3, ny * 2) * 2.2 + noise(nx * 9, ny * 5) * 0.4;
      const ring = Math.sin((ny * 38 + warp * 3.2) * Math.PI);
      const fine = noise(nx * 220, ny * 9) * 0.5 + noise(nx * 40, ny * 60) * 0.25;
      const v = 0.5 + ring * 0.18 + fine * 0.22;
      const i = (y * w + x) * 4;
      img.data[i] = 34 + v * 30;
      img.data[i + 1] = 27 + v * 22;
      img.data[i + 2] = 22 + v * 16;
      img.data[i + 3] = 255;
      const r = 150 + (1 - v) * 70;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = r;
      rimg.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  rg.putImageData(rimg, 0, 0);
  return { map: finish(c, true, [1, 1]), roughnessMap: finish(rc, false, [1, 1]) };
}

/** Fine felt for the desk mat. */
export function feltTexture(size = 512) {
  const noise = makeNoise(3);
  const [c, g] = canvas(size, size);
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v = noise(x * 0.9, y * 0.9) * 0.5 + noise(x * 0.23, y * 0.23) * 0.5;
      const i = (y * size + x) * 4;
      const k = 28 + v * 10;
      img.data[i] = k;
      img.data[i + 1] = k + 1;
      img.data[i + 2] = k + 3;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return finish(c, true, [3, 1.3]);
}

/** A crisp text label for small printed or engraved details. */
export function labelTexture(
  lines: { text: string; size: number; weight?: number; color?: string; tracking?: number; font?: string }[],
  opts: { w: number; h: number; bg?: string; align?: 'center' | 'left'; pad?: number },
) {
  const scale = 4;
  const [c, g] = canvas(opts.w * scale, opts.h * scale);
  g.scale(scale, scale);
  if (opts.bg) {
    g.fillStyle = opts.bg;
    g.fillRect(0, 0, opts.w, opts.h);
  }
  const total = lines.reduce((a, l) => a + l.size * 1.25, 0);
  let y = (opts.h - total) / 2;
  for (const l of lines) {
    y += l.size * 1.25;
    g.font = `${l.weight ?? 600} ${l.size}px ${l.font ?? 'Inter Variable, Helvetica, Arial, sans-serif'}`;
    g.fillStyle = l.color ?? '#f4f5f7';
    g.textBaseline = 'alphabetic';
    // letterSpacing is widely supported on canvas; harmless where it is not.
    (g as unknown as { letterSpacing: string }).letterSpacing = `${l.tracking ?? 0}px`;
    const x = opts.align === 'left' ? (opts.pad ?? 8) : opts.w / 2;
    g.textAlign = opts.align === 'left' ? 'left' : 'center';
    g.fillText(l.text, x, y - l.size * 0.22);
  }
  return finish(c);
}

/** Sticker grid for the puzzle cube faces. */
export function stickerTexture(color: string, cols: number, rows: number) {
  const cell = 64;
  const [c, g] = canvas(cols * cell, rows * cell);
  g.fillStyle = '#0d0e10';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = color;
  const inset = 6;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = i * cell + inset;
      const y = j * cell + inset;
      const s = cell - inset * 2;
      g.beginPath();
      g.roundRect(x, y, s, s, 9);
      g.fill();
    }
  }
  return finish(c);
}

/** Soft radial glow, used for the floor pool of light. */
export function radialTexture(inner: string, outer: string, size = 256) {
  const [c, g] = canvas(size, size);
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return finish(c);
}
