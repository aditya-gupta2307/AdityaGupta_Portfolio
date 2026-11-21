import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { StudioEnvironment, type Panel } from './StudioEnvironment';
import { rig } from './bridge';

const PANELS: Panel[] = [
  { size: [6, 2.5], position: [0, 4, 2], rotation: [Math.PI / 2.4, 0, 0], color: '#f4f5f7', intensity: 2.2 },
  { size: [4, 1], position: [-4, 1.5, 0], rotation: [0, Math.PI / 2, 0], color: '#ffe9d2', intensity: 1.2 },
  { size: [4, 0.6], position: [4, 1.5, -1], rotation: [0, -Math.PI / 2, 0], color: '#d6e0ff', intensity: 1 },
  { shape: 'ring', size: [2.5, 2.5], position: [0, 2, -4], color: '#b9bec6', intensity: 0.6 },
];

/**
 * Studio lighting: a soft key from the front-left that casts the shadows, a
 * cool rim from behind for silhouettes, a low hemisphere fill, and a
 * procedural environment (no downloaded HDR) for reflections on metal.
 */
export function Lights({ shadows, mapSize }: { shadows: boolean; mapSize: number }) {
  const hemi = useRef<THREE.HemisphereLight>(null);
  const warm = new THREE.Color('#3a2a1c');
  const cool = new THREE.Color('#14161a');

  useFrame(() => {
    // The About section brings the lamp up; let the room warm with it.
    if (hemi.current) hemi.current.groundColor.copy(cool).lerp(warm, Math.max(0, Math.min(1, rig.lamp - 1)));
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#c9d0dc', '#14161a', 0.45]} />
      <directionalLight
        position={[-1.4, 2.4, 1.6]}
        intensity={2.1}
        color="#fff3e6"
        castShadow={shadows}
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.015}
        shadow-camera-left={-1.1}
        shadow-camera-right={1.1}
        shadow-camera-top={0.9}
        shadow-camera-bottom={-0.9}
        shadow-camera-near={0.5}
        shadow-camera-far={6}
      />
      <directionalLight position={[1.6, 1.3, -1.8]} intensity={1.1} color="#c7d3ff" />
      <directionalLight position={[2.2, 0.6, 1.2]} intensity={0.25} color="#e8ecf4" />

      <StudioEnvironment panels={PANELS} />
    </>
  );
}
