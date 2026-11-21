import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { paint, rubber, darkMetal, glossy, aluminium, disposeMaterials } from './materials';
import { roundedBox, tube } from './geometry';
import { labelTexture } from './textures';

interface Section {
  x: number;
  /** Half extents of the cross-section. */
  w: number;
  h: number;
  /** Centre height. */
  y: number;
}

/**
 * Loft a smooth body through super-elliptical cross-sections along x.
 * The exponent sits between an ellipse (2) and a rounded rectangle.
 */
function loft(sections: Section[], radial = 28, exponent = 2.6, zOffset = 0) {
  const pos: number[] = [];
  const idx: number[] = [];
  const e = 2 / exponent;
  for (const s of sections) {
    for (let i = 0; i < radial; i++) {
      const a = (i / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const z = Math.sign(c) * Math.pow(Math.abs(c), e) * s.w + zOffset;
      const y = Math.sign(sn) * Math.pow(Math.abs(sn), e) * s.h + s.y;
      pos.push(s.x, y, z);
    }
  }
  for (let r = 0; r < sections.length - 1; r++) {
    for (let i = 0; i < radial; i++) {
      const a = r * radial + i;
      const b = r * radial + ((i + 1) % radial);
      const c = (r + 1) * radial + i;
      const d = (r + 1) * radial + ((i + 1) % radial);
      idx.push(a, c, b, b, c, d);
    }
  }
  // Caps
  const capStart = pos.length / 3;
  const first = sections[0];
  const last = sections[sections.length - 1];
  pos.push(first.x, first.y, zOffset, last.x, last.y, zOffset);
  for (let i = 0; i < radial; i++) {
    const n = (i + 1) % radial;
    idx.push(capStart, i, n);
    const o = (sections.length - 1) * radial;
    idx.push(capStart + 1, o + n, o + i);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const BODY: Section[] = [
  { x: 0.126, w: 0.005, h: 0.0035, y: 0.0175 },
  { x: 0.112, w: 0.0068, h: 0.0048, y: 0.0182 },
  { x: 0.09, w: 0.0092, h: 0.0062, y: 0.02 },
  { x: 0.065, w: 0.0125, h: 0.0082, y: 0.0225 },
  { x: 0.04, w: 0.0185, h: 0.0115, y: 0.0255 },
  { x: 0.012, w: 0.0205, h: 0.0138, y: 0.0278 },
  { x: -0.015, w: 0.0215, h: 0.0165, y: 0.0305 },
  { x: -0.045, w: 0.0185, h: 0.015, y: 0.0295 },
  { x: -0.075, w: 0.0125, h: 0.0108, y: 0.026 },
  { x: -0.1, w: 0.0065, h: 0.0072, y: 0.0235 },
  { x: -0.112, w: 0.004, h: 0.005, y: 0.0225 },
];

const POD: Section[] = [
  { x: 0.03, w: 0.003, h: 0.0035, y: 0.0175 },
  { x: 0.02, w: 0.0085, h: 0.0072, y: 0.0185 },
  { x: -0.005, w: 0.0095, h: 0.0082, y: 0.0195 },
  { x: -0.04, w: 0.0072, h: 0.0068, y: 0.018 },
  { x: -0.07, w: 0.0025, h: 0.0035, y: 0.0155 },
];

const WHEELS = [
  { x: 0.086, z: 0.044, r: 0.0168, w: 0.0135 },
  { x: -0.077, z: 0.042, r: 0.0178, w: 0.0175 },
];

interface CarProps {
  /** 0..1: rolls the car forward a little and spins the wheels. */
  active?: number;
  accent?: string;
  showPlinth?: boolean;
}

/**
 * A procedural Formula 1-style model car at roughly 1:24 scale (24 cm long).
 * Original livery: titanium paint, carbon aero and an Undercut-amber accent.
 */
export function F1Car({ active = 0, accent = '#ffb21e', showPlinth = true }: CarProps) {
  const mats = useMemo(
    () => ({
      body: paint('#c3c7ce'),
      carbon: new THREE.MeshPhysicalMaterial({ color: '#141518', roughness: 0.42, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
      accent: paint(accent),
      tyre: rubber('#111214'),
      rim: darkMetal('#3a3d43', 0.3),
      helmet: glossy('#f4f5f7', 0.2),
      visor: glossy('#0b0c0e', 0.05),
      plinth: glossy('#0b0c0e', 0.18),
      metal: aluminium('#b9bec6', 0.3),
      label: new THREE.MeshBasicMaterial({
        map: labelTexture([{ text: 'UNDERCUT', size: 15, weight: 600, color: '#b9bec6', tracking: 6 }], { w: 260, h: 30 }),
        transparent: true,
      }),
    }),
    [accent],
  );
  mats.label.userData.keepEmissive = true;
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const geo = useMemo(() => {
    const body = loft(BODY, 32);
    const podL = loft(POD, 24, 2.8, 0.024);
    const podR = loft(POD, 24, 2.8, -0.024);
    const fin = new THREE.ExtrudeGeometry(
      new THREE.Shape([
        new THREE.Vector2(-0.012, 0),
        new THREE.Vector2(-0.092, 0),
        new THREE.Vector2(-0.092, 0.006),
        new THREE.Vector2(-0.03, 0.016),
        new THREE.Vector2(-0.012, 0.016),
      ]),
      { depth: 0.0012, bevelEnabled: false },
    );
    fin.translate(0, 0.032, -0.0006);
    const halo = new THREE.TorusGeometry(0.0145, 0.0016, 10, 40, Math.PI * 1.05);
    const pillar = tube(
      [
        [0.03, 0.033, 0],
        [0.029, 0.04, 0],
        [0.024, 0.0445, 0],
      ],
      0.0016,
      10,
      8,
    );
    const arms: THREE.BufferGeometry[] = [];
    for (const w of WHEELS) {
      for (const s of [1, -1]) {
        const hub: [number, number, number] = [w.x, w.r + 0.002, s * (w.z - w.w / 2 - 0.001)];
        arms.push(tube([[w.x + 0.009, w.r + 0.006, s * 0.014], hub], 0.0008, 4, 6));
        arms.push(tube([[w.x - 0.009, w.r + 0.006, s * 0.014], hub], 0.0008, 4, 6));
      }
    }
    return { body, podL, podR, fin, halo, pillar, arms };
  }, []);
  useEffect(
    () => () =>
      Object.values(geo)
        .flat()
        .forEach((g) => g.dispose()),
    [geo],
  );

  const roll = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group[]>([]);
  const spin = useRef(0);
  const offset = useRef(0);

  useFrame((_, dt) => {
    const target = active * 0.012;
    const prev = offset.current;
    offset.current = THREE.MathUtils.damp(offset.current, target, 5, dt);
    const dx = offset.current - prev;
    spin.current -= dx / 0.017;
    if (roll.current) roll.current.position.x = offset.current;
    wheels.current.forEach((w) => w && (w.rotation.z = spin.current));
  });

  return (
    <group>
      {showPlinth && (
        <group>
          <mesh geometry={roundedBox(0.29, 0.01, 0.12, 0.003)} material={mats.plinth} position={[0, 0.005, 0]} castShadow receiveShadow />
          <mesh material={mats.label} position={[0, 0.005, 0.0602]}>
            <planeGeometry args={[0.09, 0.0104]} />
          </mesh>
        </group>
      )}
      <group ref={roll} position={[0, showPlinth ? 0.01 : 0, 0]}>
        {/* Monocoque, nose and engine cover */}
        <mesh geometry={geo.body} material={mats.body} castShadow />
        <mesh geometry={geo.podL} material={mats.body} castShadow />
        <mesh geometry={geo.podR} material={mats.body} castShadow />
        <mesh geometry={geo.fin} material={mats.carbon} castShadow />
        {/* Accent stripe on the nose */}
        <mesh material={mats.accent} position={[0.085, 0.0272, 0]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.04, 0.0006, 0.004]} />
        </mesh>
        {/* Cockpit, driver and airbox */}
        <mesh material={mats.carbon} position={[0.012, 0.0405, 0]} scale={[0.02, 0.0035, 0.012]}>
          <sphereGeometry args={[1, 24, 12]} />
        </mesh>
        <mesh material={mats.helmet} position={[0.006, 0.0438, 0]}>
          <sphereGeometry args={[0.0074, 24, 16]} />
        </mesh>
        <mesh material={mats.visor} position={[0.0108, 0.0446, 0]} scale={[0.4, 0.38, 0.85]}>
          <sphereGeometry args={[0.0074, 20, 12]} />
        </mesh>
        <mesh geometry={roundedBox(0.02, 0.011, 0.014, 0.004)} material={mats.body} position={[-0.012, 0.047, 0]} castShadow />
        <mesh material={mats.carbon} position={[-0.0025, 0.048, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.0045, 20]} />
        </mesh>
        {/* Halo */}
        <mesh geometry={geo.halo} material={mats.carbon} position={[0.008, 0.0455, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 2 - 0.08]} castShadow />
        <mesh geometry={geo.pillar} material={mats.carbon} />
        {/* Floor */}
        <mesh geometry={roundedBox(0.19, 0.0016, 0.074, 0.0007)} material={mats.carbon} position={[-0.01, 0.0085, 0]} castShadow />
        {/* Front wing: main plane, accent flap and endplates */}
        <group position={[0.116, 0, 0]}>
          <mesh geometry={roundedBox(0.022, 0.0016, 0.094, 0.0007)} material={mats.carbon} position={[0, 0.0065, 0]} castShadow />
          <mesh geometry={roundedBox(0.012, 0.0014, 0.086, 0.0006)} material={mats.accent} position={[-0.008, 0.0098, 0]} rotation={[0, 0, 0.32]} castShadow />
          {[1, -1].map((s) => (
            <mesh key={s} geometry={roundedBox(0.028, 0.012, 0.0012, 0.0005)} material={mats.carbon} position={[-0.004, 0.0105, s * 0.0475]} castShadow />
          ))}
        </group>
        {/* Rear wing: main plane, accent flap, endplates, pylon */}
        <group position={[-0.108, 0, 0]}>
          <mesh geometry={roundedBox(0.02, 0.0022, 0.074, 0.0009)} material={mats.carbon} position={[0, 0.05, 0]} castShadow />
          <mesh geometry={roundedBox(0.012, 0.0018, 0.074, 0.0008)} material={mats.accent} position={[-0.007, 0.0565, 0]} rotation={[0, 0, 0.28]} castShadow />
          {[1, -1].map((s) => (
            <mesh key={s} geometry={roundedBox(0.032, 0.036, 0.0013, 0.0006)} material={mats.carbon} position={[-0.004, 0.042, s * 0.0377]} castShadow />
          ))}
          <mesh geometry={roundedBox(0.014, 0.026, 0.002, 0.0008)} material={mats.carbon} position={[0.002, 0.036, 0]} />
        </group>
        {/* Suspension */}
        {geo.arms.map((g, i) => (
          <mesh key={i} geometry={g} material={mats.carbon} />
        ))}
        {/* Wheels */}
        {WHEELS.flatMap((w) =>
          [1, -1].map((s) => (
            <group key={`${w.x}${s}`} position={[w.x, w.r, s * w.z]}>
              <group
                ref={(g) => {
                  if (g && !wheels.current.includes(g)) wheels.current.push(g);
                }}
              >
                <mesh material={mats.tyre} rotation={[Math.PI / 2, 0, 0]} castShadow>
                  <cylinderGeometry args={[w.r, w.r, w.w, 36]} />
                </mesh>
                <mesh material={mats.rim} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[w.r * 0.62, w.r * 0.62, w.w + 0.0006, 24]} />
                </mesh>
                {[0, 1, 2, 3, 4].map((k) => (
                  <mesh key={k} material={mats.metal} position={[0, 0, s * (w.w / 2 + 0.0004)]} rotation={[0, 0, (k * Math.PI * 2) / 5]}>
                    <boxGeometry args={[w.r * 1.1, 0.0012, 0.0004]} />
                  </mesh>
                ))}
              </group>
            </group>
          )),
        )}
      </group>
    </group>
  );
}
