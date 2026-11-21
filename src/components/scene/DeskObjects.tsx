import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { aluminium, ceramic, darkMetal, plastic, rubber, disposeMaterials } from './materials';
import { lathe, tube } from './geometry';
import { useStore } from '../../state/store';
import { rig } from './bridge';

/* ------------------------------------------------------------------ */
/* Mouse                                                               */
/* ------------------------------------------------------------------ */

export function Mouse() {
  const mats = useMemo(() => ({ shell: ceramic('#e9eaec'), base: plastic('#1a1b1e', 0.8), seam: plastic('#9aa0a8', 0.5), wheel: rubber('#2b2d31') }), []);
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);
  const click = useRef(0);
  const shell = useRef<THREE.Group>(null);
  const hovered = useStore((s) => s.hovered === 'mouse');

  useFrame((_, dt) => {
    click.current = THREE.MathUtils.damp(click.current, hovered ? 1 : 0, 8, dt);
    if (shell.current) shell.current.rotation.x = click.current * 0.03;
  });

  return (
    <group>
      <group ref={shell}>
        {/* Upper shell: a flattened half-ellipsoid, slightly fuller at the back. */}
        <mesh material={mats.shell} scale={[0.031, 0.019, 0.056]} position={[0, 0.003, 0]} castShadow>
          <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
        <mesh material={mats.seam} position={[0, 0.0205, -0.024]} rotation={[-0.32, 0, 0]}>
          <boxGeometry args={[0.0008, 0.0006, 0.03]} />
        </mesh>
        <mesh material={mats.wheel} position={[0, 0.0196, -0.026]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.003, 20]} />
        </mesh>
      </group>
      <mesh material={mats.base} scale={[0.031, 1, 0.056]} position={[0, 0.0015, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.003, 48]} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Coffee mug on a coaster                                             */
/* ------------------------------------------------------------------ */

export function Mug() {
  const mats = useMemo(
    () => ({
      body: ceramic('#e8e6e1'),
      coffee: new THREE.MeshPhysicalMaterial({ color: '#2a170d', roughness: 0.12, clearcoat: 1 }),
      coaster: plastic('#3a3f46', 0.95),
    }),
    [],
  );
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const body = useMemo(
    () =>
      lathe([
        [0, 0.004],
        [0.036, 0.004],
        [0.039, 0.008],
        [0.04, 0.09],
        [0.0405, 0.095],
        [0.0375, 0.095],
        [0.0365, 0.09],
        [0.0355, 0.012],
        [0, 0.012],
      ]),
    [],
  );
  const handle = useMemo(
    () =>
      tube(
        [
          [0.039, 0.078, 0],
          [0.062, 0.074, 0],
          [0.066, 0.05, 0],
          [0.058, 0.03, 0],
          [0.039, 0.026, 0],
        ],
        0.0055,
        40,
        12,
      ),
    [],
  );

  const turns = useStore((s) => s.mugTurns);
  const group = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, -0.6 + turns * (Math.PI / 2), 5, dt);
  });

  return (
    <group>
      <mesh material={mats.coaster} position={[0, 0.002, 0]} receiveShadow>
        <cylinderGeometry args={[0.052, 0.052, 0.004, 48]} />
      </mesh>
      <group ref={group} position={[0, 0.002, 0]}>
        <mesh geometry={body} material={mats.body} castShadow receiveShadow />
        <mesh geometry={handle} material={mats.body} castShadow />
        <mesh material={mats.coffee} position={[0, 0.078, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.0358, 40]} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Headphones on a minimal stand                                       */
/* ------------------------------------------------------------------ */

export function Headphones() {
  const mats = useMemo(
    () => ({
      stand: aluminium('#a7acb4', 0.3),
      standBase: darkMetal('#1c1e22', 0.5),
      band: plastic('#1d1f23', 0.55),
      pad: new THREE.MeshStandardMaterial({ color: '#232529', roughness: 0.85 }),
      cup: new THREE.MeshPhysicalMaterial({ color: '#2b2e33', roughness: 0.45, metalness: 0.2, clearcoat: 0.4 }),
      yoke: aluminium('#c2c6cd', 0.25),
    }),
    [],
  );
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const R = 0.082; // headband radius
  const topY = 0.255;
  const centerY = topY - R;
  const hovered = useStore((s) => s.hovered === 'headphones');
  const hp = useRef<THREE.Group>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current = THREE.MathUtils.damp(t.current, hovered ? 1 : 0, 6, dt);
    if (hp.current) hp.current.rotation.z = t.current * 0.06;
  });

  return (
    <group>
      {/* Stand */}
      <mesh material={mats.standBase} position={[0, 0.004, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.055, 0.058, 0.008, 48]} />
      </mesh>
      <mesh material={mats.stand} position={[0, topY / 2, 0]} castShadow>
        <cylinderGeometry args={[0.0055, 0.0065, topY - 0.01, 20]} />
      </mesh>
      <mesh material={mats.stand} position={[0, topY - 0.004, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.05, 20]} />
      </mesh>

      {/* Headphones, pivoting gently on the stand when hovered. */}
      <group ref={hp} position={[0, centerY, 0]}>
        <mesh material={mats.band} castShadow>
          <torusGeometry args={[R, 0.0075, 14, 64, Math.PI]} />
        </mesh>
        <mesh material={mats.pad} position={[0, 0, 0]} scale={[1, 1, 2.2]}>
          <torusGeometry args={[R - 0.009, 0.0045, 10, 48, Math.PI * 0.6]} />
        </mesh>
        {[-1, 1].map((s) => (
          <group key={s} position={[s * R, -0.05, 0]}>
            <mesh material={mats.yoke} position={[0, 0.032, 0]} castShadow>
              <boxGeometry args={[0.006, 0.03, 0.006]} />
            </mesh>
            <mesh material={mats.cup} rotation={[0, 0, Math.PI / 2]} position={[-s * 0.004, 0, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.042, 0.026, 40]} />
            </mesh>
            <mesh material={mats.pad} rotation={[0, Math.PI / 2, 0]} position={[-s * 0.019, 0, 0]}>
              <torusGeometry args={[0.03, 0.009, 14, 40]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Desk lamp                                                           */
/* ------------------------------------------------------------------ */

const LAMP_COLOR = new THREE.Color('#ffc98f');

export function Lamp({ shadows }: { shadows: boolean }) {
  const mats = useMemo(
    () => ({
      metal: darkMetal('#202226', 0.4),
      joint: aluminium('#b9bec6', 0.3),
      bulb: new THREE.MeshBasicMaterial({ color: LAMP_COLOR, toneMapped: false }),
    }),
    [],
  );
  mats.bulb.userData.keepEmissive = true;
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const lampOn = useStore((s) => s.lampOn);
  const spot = useRef<THREE.SpotLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);
  const level = useRef(1);

  // Arm geometry: base → elbow → head.
  const base: [number, number, number] = [0, 0.012, 0];
  const elbow: [number, number, number] = [0.05, 0.3, -0.02];
  const head: [number, number, number] = [0.27, 0.36, 0.02];

  const lower = useMemo(() => tube([base, [0.03, 0.16, -0.012], elbow], 0.0055, 20, 10), []);
  const upper = useMemo(() => tube([elbow, [0.16, 0.355, 0], head], 0.0048, 20, 10), []);

  useFrame((_, dt) => {
    level.current = THREE.MathUtils.damp(level.current, lampOn ? rig.lamp : 0, 4, dt);
    if (spot.current) spot.current.intensity = level.current * 3.2;
    mats.bulb.color.copy(LAMP_COLOR).multiplyScalar(0.25 + level.current * 0.75);
  });

  return (
    <group>
      <mesh material={mats.metal} position={[0, 0.006, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.068, 0.072, 0.012, 48]} />
      </mesh>
      <mesh geometry={lower} material={mats.metal} castShadow />
      <mesh geometry={upper} material={mats.metal} castShadow />
      <mesh material={mats.joint} position={elbow}>
        <sphereGeometry args={[0.011, 20, 16]} />
      </mesh>
      <mesh material={mats.joint} position={base}>
        <sphereGeometry args={[0.01, 20, 16]} />
      </mesh>

      {/* Shade, tilted down toward the desk. */}
      <group position={head} rotation={[0, 0, -0.95]}>
        <mesh material={mats.metal} position={[0, -0.03, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.044, 0.07, 40, 1, true]} />
        </mesh>
        <mesh material={mats.metal} position={[0, 0.005, 0]}>
          <cylinderGeometry args={[0.016, 0.022, 0.006, 32]} />
        </mesh>
        <mesh material={mats.bulb} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.036, 32]} />
        </mesh>
        <spotLight
          ref={spot}
          color={LAMP_COLOR}
          position={[0, -0.05, 0]}
          angle={0.85}
          penumbra={0.85}
          distance={1.6}
          decay={1.6}
          intensity={3.2}
          castShadow={shadows}
          shadow-mapSize={[512, 512]}
          shadow-bias={-0.0006}
          target={target}
        />
        <primitive object={target} position={[0, -1, 0]} />
      </group>
    </group>
  );
}
