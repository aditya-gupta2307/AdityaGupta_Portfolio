import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { aluminium, plastic, disposeMaterials } from './materials';
import { roundedBox } from './geometry';
import { labelTexture, stickerTexture } from './textures';
import { useStore } from '../../state/store';
import { education } from '../../data/profile';

/* ------------------------------------------------------------------ */
/* Purdue: current coursework books and a small nameplate              */
/* ------------------------------------------------------------------ */

const BOOKS = education.inProgress.courses.slice(0, 3).map((c, i) => ({
  ...c,
  h: [0.03, 0.024, 0.027][i],
  w: [0.2, 0.19, 0.205][i],
  d: [0.145, 0.14, 0.15][i],
  color: ['#1c1d21', '#cfb991', '#3a3e45'][i],
  ink: ['#cfb991', '#1a1508', '#e6e7ea'][i],
  turn: [0.04, -0.05, 0.02][i],
}));

export function PurdueCorner() {
  const mats = useMemo(() => {
    const books = BOOKS.map((b) => {
      const cover = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.78 });
      const pages = new THREE.MeshStandardMaterial({ color: '#e7e2d6', roughness: 0.95 });
      const spine = new THREE.MeshStandardMaterial({
        roughness: 0.75,
        map: labelTexture(
          [
            { text: b.code, size: 12, weight: 700, color: b.ink, tracking: 1.5 },
            { text: b.name.toUpperCase(), size: 7, weight: 600, color: b.ink, tracking: 1.2 },
          ],
          { w: 400, h: 60, bg: b.color },
        ),
      });
      return { cover, pages, spine };
    });
    const plaque = new THREE.MeshPhysicalMaterial({ color: '#0f1012', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1 });
    const plaqueFace = new THREE.MeshStandardMaterial({
      roughness: 0.5,
      metalness: 0.2,
      map: labelTexture(
        [
          { text: 'PURDUE UNIVERSITY', size: 13, weight: 700, color: '#cfb991', tracking: 3 },
          { text: 'COMPUTER SCIENCE  ·  CLASS OF 2029', size: 7.5, weight: 600, color: '#b9bec6', tracking: 2 },
        ],
        { w: 320, h: 64, bg: '#0f1012' },
      ),
    });
    const brass = aluminium('#cfb991', 0.35);
    return { books, plaque, plaqueFace, brass };
  }, []);
  useEffect(
    () => () => {
      mats.books.forEach((b) => disposeMaterials(Object.values(b)));
      disposeMaterials([mats.plaque, mats.plaqueFace, mats.brass]);
    },
    [mats],
  );

  let y = 0;
  return (
    <group>
      {BOOKS.map((b, i) => {
        const m = mats.books[i];
        const cy = y + b.h / 2;
        y += b.h;
        // Faces: +x spine, −x fore-edge, ±y covers, ±z page edges.
        return (
          <group key={b.code} position={[0, cy, 0]} rotation={[0, b.turn, 0]}>
            <mesh geometry={roundedBox(b.d, b.h, b.w, 0.0015)} material={[m.spine, m.pages, m.cover, m.cover, m.pages, m.pages]} castShadow receiveShadow />
            <mesh material={m.cover} position={[0, b.h / 2 - 0.0012, 0]}>
              <boxGeometry args={[b.d + 0.002, 0.0024, b.w + 0.002]} />
            </mesh>
            <mesh material={m.cover} position={[0, -b.h / 2 + 0.0012, 0]}>
              <boxGeometry args={[b.d + 0.002, 0.0024, b.w + 0.002]} />
            </mesh>
          </group>
        );
      })}
      {/* Nameplate: a black acrylic wedge with a printed face, in front of the books. */}
      <group position={[0.115, 0, 0.02]} rotation={[0, Math.PI / 2 - 0.25, 0]}>
        <mesh geometry={roundedBox(0.15, 0.03, 0.022, 0.003)} material={mats.plaque} position={[0, 0.015, 0]} rotation={[-0.32, 0, 0]} castShadow />
        <mesh material={mats.plaqueFace} position={[0, 0.0175, 0.0108]} rotation={[-0.32, 0, 0]}>
          <planeGeometry args={[0.14, 0.028]} />
        </mesh>
        <mesh material={mats.brass} position={[0, 0.0012, 0.004]}>
          <boxGeometry args={[0.152, 0.0024, 0.03]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Notebook and pen                                                    */
/* ------------------------------------------------------------------ */

export function Notebook() {
  const mats = useMemo(
    () => ({
      cover: new THREE.MeshStandardMaterial({ color: '#25272b', roughness: 0.82 }),
      pages: new THREE.MeshStandardMaterial({ color: '#ebe7dd', roughness: 0.95 }),
      band: plastic('#cfb991', 0.6),
      pen: aluminium('#c8ccd2', 0.25),
      penTip: plastic('#101113', 0.4),
    }),
    [],
  );
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);
  return (
    <group>
      <mesh geometry={roundedBox(0.15, 0.013, 0.21, 0.003)} material={[mats.pages, mats.cover, mats.cover, mats.cover, mats.pages, mats.pages]} position={[0, 0.0065, 0]} castShadow receiveShadow />
      <mesh material={mats.band} position={[0.05, 0.0132, 0]}>
        <boxGeometry args={[0.005, 0.0008, 0.212]} />
      </mesh>
      <group position={[-0.02, 0.0172, 0.01]} rotation={[0, 0.5, 0]}>
        <mesh material={mats.pen} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.0042, 0.0042, 0.13, 20]} />
        </mesh>
        <mesh material={mats.penTip} position={[0, 0, 0.071]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.0042, 0.012, 20]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Puzzle cube: two pieces so the top layer can turn on click          */
/* ------------------------------------------------------------------ */

const C = 0.054; // cube edge
const FACE = ['#c9cdd3', '#d1a64a', '#9b4b3d', '#3e6d8f', '#4f7d5b', '#d5d1c4']; // muted stickers

export function PuzzleCube() {
  const mats = useMemo(() => {
    const make = (color: string, cols: number, rows: number) => new THREE.MeshStandardMaterial({ map: stickerTexture(color, cols, rows), roughness: 0.4 });
    const body = new THREE.MeshStandardMaterial({ color: '#0d0e10', roughness: 0.5 });
    // Box face order: +x, −x, +y, −y, +z, −z
    const bottom = [make(FACE[2], 3, 2), make(FACE[3], 3, 2), body, make(FACE[5], 3, 3), make(FACE[4], 3, 2), make(FACE[1], 3, 2)];
    const top = [make(FACE[2], 3, 1), make(FACE[3], 3, 1), make(FACE[0], 3, 3), body, make(FACE[4], 3, 1), make(FACE[1], 3, 1)];
    return { bottom, top, body };
  }, []);
  useEffect(() => () => disposeMaterials([...mats.bottom, ...mats.top]), [mats]);

  const turns = useStore((s) => s.cubeTurns);
  const topRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (topRef.current) topRef.current.rotation.y = THREE.MathUtils.damp(topRef.current.rotation.y, turns * (Math.PI / 2), 7, dt);
  });

  return (
    <group rotation={[0, 0.5, 0]}>
      <mesh geometry={roundedBox(C, (C * 2) / 3, C, 0.003)} material={mats.bottom} position={[0, C / 3, 0]} castShadow receiveShadow />
      <group ref={topRef} position={[0, (C * 5) / 6 + 0.0004, 0]}>
        <mesh geometry={roundedBox(C, C / 3 - 0.0008, C, 0.003)} material={mats.top} castShadow />
      </group>
    </group>
  );
}
