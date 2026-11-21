import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { rig } from './bridge';

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

      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#060708']} />
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} rotation-x={Math.PI / 2.4} scale={[6, 2.5, 1]} color="#f4f5f7" />
        <Lightformer form="rect" intensity={1.2} position={[-4, 1.5, 0]} rotation-y={Math.PI / 2} scale={[4, 1, 1]} color="#ffe9d2" />
        <Lightformer form="rect" intensity={1} position={[4, 1.5, -1]} rotation-y={-Math.PI / 2} scale={[4, 0.6, 1]} color="#d6e0ff" />
        <Lightformer form="ring" intensity={0.6} position={[0, 2, -4]} scale={2.5} color="#b9bec6" />
      </Environment>
    </>
  );
}
