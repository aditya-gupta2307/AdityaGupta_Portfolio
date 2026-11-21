import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { aluminium, glass, disposeMaterials } from './materials';
import { roundedBox } from './geometry';
import { SCREEN, screenRect } from './bridge';
import { useStore } from '../../state/store';

RectAreaLightUniformsLib.init();

const BODY = { w: 0.64, h: 0.376, d: 0.016 };
const corners = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];

interface Props {
  /** The interface rendered on the screen (real DOM, placed in 3D). */
  screen: ReactNode;
  /** Hide the in-3D screen while the full-screen workspace covers it. */
  screenHidden: boolean;
  reducedMotion: boolean;
}

/**
 * A slim aluminium display on a single-column stand. The screen is a real
 * HTML interface positioned in 3D with a CSS matrix, so text stays sharp and
 * clickable; a rect-area light makes the screen glow onto the desk.
 */
export function Monitor({ screen, screenHidden, reducedMotion }: Props) {
  const on = useStore((s) => s.screenOn);
  const power = useRef(0);
  const screenMesh = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.RectAreaLight>(null);
  const htmlWrap = useRef<HTMLDivElement>(null);
  const { size, camera } = useThree();

  const mats = useMemo(
    () => ({
      body: aluminium('#a9aeb6', 0.3),
      back: aluminium('#9ca1a9', 0.42),
      glass: glass(),
      panel: new THREE.MeshBasicMaterial({ color: '#000000', toneMapped: false }),
      stand: aluminium('#b3b8c0', 0.28),
      foot: new THREE.MeshStandardMaterial({ color: '#0e0f11', roughness: 0.9 }),
    }),
    [],
  );
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const [cx, cy, cz] = SCREEN.center;
  const bodyZ = cz - 0.0082; // body centre so the glass face sits at the screen plane

  useFrame((_, dt) => {
    const target = on ? 1 : 0;
    power.current = reducedMotion ? target : THREE.MathUtils.damp(power.current, target, on ? 2.2 : 6, dt);
    const p = power.current;
    // Panel colour: off-black when powered down, a lit dark grey when on.
    mats.panel.color.setRGB(0.012 + p * 0.05, 0.013 + p * 0.054, 0.016 + p * 0.062);
    if (light.current) light.current.intensity = p * 4.2;
    if (htmlWrap.current) {
      htmlWrap.current.style.opacity = String(Math.min(1, Math.max(0, (p - 0.15) / 0.85)));
      htmlWrap.current.style.filter = p < 0.98 ? `brightness(${0.6 + p * 0.4}) blur(${(1 - p) * 4}px)` : '';
    }

    // Project the screen corners so the full-screen workspace can start
    // exactly where the monitor is.
    if (screenMesh.current) {
      const hw = SCREEN.width / 2;
      const hh = SCREEN.height / 2;
      corners[0].set(-hw, hh, 0);
      corners[1].set(hw, hh, 0);
      corners[2].set(hw, -hh, 0);
      corners[3].set(-hw, -hh, 0);
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
      for (const c of corners) {
        screenMesh.current.localToWorld(c);
        c.project(camera);
        const x = (c.x * 0.5 + 0.5) * size.width;
        const y = (-c.y * 0.5 + 0.5) * size.height;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
      screenRect.x = minX;
      screenRect.y = minY;
      screenRect.w = maxX - minX;
      screenRect.h = maxY - minY;
      screenRect.valid = true;
    }
  });

  const distanceFactor = (400 * SCREEN.width) / SCREEN.cssWidth;

  return (
    <group>
      {/* Display body */}
      <mesh geometry={roundedBox(BODY.w, BODY.h, BODY.d, 0.007)} material={mats.body} position={[cx, cy + 0.006, bodyZ]} castShadow />
      {/* Slightly domed back cover */}
      <mesh geometry={roundedBox(BODY.w * 0.82, BODY.h * 0.78, 0.012, 0.005)} material={mats.back} position={[cx, cy + 0.01, bodyZ - 0.012]} castShadow />
      {/* Front glass */}
      <mesh material={mats.glass} position={[cx, cy + 0.006, cz - 0.0004]}>
        <planeGeometry args={[BODY.w - 0.006, BODY.h - 0.006]} />
      </mesh>
      {/* Active panel */}
      <mesh ref={screenMesh} material={mats.panel} position={[cx, cy, cz]}>
        <planeGeometry args={[SCREEN.width, SCREEN.height]} />
      </mesh>

      <rectAreaLight
        ref={light}
        args={['#dfe6f2', 0, SCREEN.width, SCREEN.height]}
        position={[cx, cy, cz + 0.01]}
        rotation={[0, 0, 0]}
      />

      {/* Stand: hinge, a single tapered column and a thin foot. */}
      <mesh material={mats.stand} position={[cx, cy + 0.02, bodyZ - 0.026]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.09, 32]} />
      </mesh>
      <mesh
        geometry={roundedBox(0.07, 0.34, 0.012, 0.004)}
        material={mats.stand}
        position={[cx, 0.17, bodyZ - 0.05]}
        rotation={[-0.11, 0, 0]}
        castShadow
      />
      <mesh geometry={roundedBox(0.22, 0.008, 0.17, 0.004)} material={mats.stand} position={[cx, 0.004, bodyZ - 0.02]} castShadow receiveShadow />
      <mesh material={mats.foot} position={[cx, 0.0008, bodyZ - 0.02]}>
        <boxGeometry args={[0.2, 0.0016, 0.15]} />
      </mesh>

      {/* The interface, as real DOM on the screen plane. */}
      <Html
        transform
        position={[cx, cy, cz + 0.0006]}
        distanceFactor={distanceFactor}
        zIndexRange={[5, 0]}
        style={{ width: SCREEN.cssWidth, height: SCREEN.cssHeight, visibility: screenHidden ? 'hidden' : 'visible' }}
      >
        <div ref={htmlWrap} className="monitor-screen" style={{ opacity: 0 }}>
          {screen}
        </div>
      </Html>
    </group>
  );
}
