import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { woodTextures, feltTexture, radialTexture } from './textures';
import { darkMetal, disposeMaterials } from './materials';
import { roundedBox } from './geometry';

export const DESK = { width: 1.6, depth: 0.76, thickness: 0.032, height: 0.74 };

/** The desk, its frame, the desk mat and the room around them. */
export function Desk({ quality }: { quality: 'high' | 'low' }) {
  const mats = useMemo(() => {
    const wood = woodTextures(quality === 'high' ? 1024 : 512);
    wood.map.repeat.set(1, 1);
    const top = new THREE.MeshPhysicalMaterial({
      map: wood.map,
      roughnessMap: wood.roughnessMap,
      roughness: 0.75,
      clearcoat: 0.35,
      clearcoatRoughness: 0.55,
    });
    const edge = new THREE.MeshStandardMaterial({ color: '#1f1915', roughness: 0.7 });
    const frame = darkMetal('#1b1d21', 0.55);
    const mat = new THREE.MeshStandardMaterial({ map: feltTexture(), roughness: 1 });
    const floor = new THREE.MeshStandardMaterial({ color: '#0b0c0e', roughness: 0.92 });
    const wall = new THREE.MeshStandardMaterial({ color: '#0d0e11', roughness: 1 });
    const pool = new THREE.MeshBasicMaterial({
      map: radialTexture('rgba(185,190,198,0.10)', 'rgba(185,190,198,0)'),
      transparent: true,
      depthWrite: false,
    });
    return { top, edge, frame, mat, floor, wall, pool };
  }, [quality]);

  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const { width, depth, thickness, height } = DESK;
  const legX = width / 2 - 0.08;

  return (
    <group>
      {/* Desktop slab: rounded edge, wood top. */}
      <mesh
        geometry={roundedBox(width, thickness, depth, 0.008)}
        position={[0, -thickness / 2, 0]}
        material={[mats.edge, mats.edge, mats.top, mats.edge, mats.edge, mats.edge]}
        receiveShadow
        castShadow
      />

      {/* Steel frame: two slim legs per side joined by a rail. */}
      {[-legX, legX].map((x) => (
        <group key={x} position={[x, -thickness, 0]}>
          {[-depth / 2 + 0.07, depth / 2 - 0.07].map((z) => (
            <mesh key={z} position={[0, -height / 2, z]} material={mats.frame} castShadow>
              <boxGeometry args={[0.03, height, 0.03]} />
            </mesh>
          ))}
          <mesh position={[0, -0.03, 0]} material={mats.frame}>
            <boxGeometry args={[0.03, 0.04, depth - 0.14]} />
          </mesh>
          <mesh position={[0, -height + 0.015, 0]} material={mats.frame} receiveShadow>
            <boxGeometry args={[0.04, 0.03, depth - 0.06]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -thickness - 0.03, -depth / 2 + 0.07]} material={mats.frame}>
        <boxGeometry args={[width - 0.16, 0.04, 0.02]} />
      </mesh>

      {/* Felt desk mat under the keyboard and mouse. */}
      <mesh geometry={roundedBox(0.84, 0.003, 0.34, 0.0014, 2)} position={[0.08, 0.0015, 0.13]} material={mats.mat} receiveShadow />

      {/* Floor and back wall, kept dark; a faint pool of light under the desk. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height - thickness, 0]} material={mats.floor} receiveShadow>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height - thickness + 0.002, 0]} material={mats.pool}>
        <planeGeometry args={[3.2, 3.2]} />
      </mesh>
      <mesh position={[0, 0.6, -1.35]} material={mats.wall} receiveShadow>
        <planeGeometry args={[14, 5]} />
      </mesh>
    </group>
  );
}
