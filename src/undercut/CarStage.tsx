import { useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { F1Car } from '../components/scene/F1Car';

function Model({ reducedMotion }: { reducedMotion: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    // A slow sway rather than a spin; drag to look around freely.
    if (g.current && !reducedMotion) g.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.18;
  });
  return (
    <group ref={g} scale={3.3} position={[0, -0.1, 0]}>
      <F1Car showPlinth={false} />
    </group>
  );
}

/** A small studio for the model car, used on the case-study page. */
export default function CarStage({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0.9, 0.45, 1.05], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
      }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[-1, 2, 1.5]} intensity={2} />
      <directionalLight position={[1.5, 1, -1.5]} intensity={1.2} color="#ffd59a" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[0, 3, 1]} rotation-x={Math.PI / 2.3} scale={[5, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-3, 1, 0]} rotation-y={Math.PI / 2} scale={[3, 0.6, 1]} color="#ffe3b8" />
        <Lightformer form="rect" intensity={1.2} position={[3, 1, -1]} rotation-y={-Math.PI / 2} scale={[3, 0.5, 1]} color="#ffb21e" />
      </Environment>
      <Model reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -0.12, 0]} opacity={0.6} scale={2.2} blur={2.4} far={0.6} frames={1} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.6} maxPolarAngle={1.45} target={[0, -0.02, 0]} />
    </Canvas>
  );
}
