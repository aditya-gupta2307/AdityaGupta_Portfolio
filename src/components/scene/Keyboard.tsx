import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { aluminium, plastic, disposeMaterials } from './materials';
import { keycap, roundedBox } from './geometry';
import { useStore } from '../../state/store';

const U = 0.0186; // one key unit, metres
const CAP_H = 0.0082;

type Row = [string, number][];

/** A compact 75% layout. Labels are only used to map typed keys to caps. */
const ROWS: Row[] = [
  [
    ['Escape', 1],
    ['F1', 1],
    ['F2', 1],
    ['F3', 1],
    ['F4', 1],
    ['F5', 1],
    ['F6', 1],
    ['F7', 1],
    ['F8', 1],
    ['F9', 1],
    ['F10', 1],
    ['F11', 1],
    ['F12', 1],
    ['Delete', 1],
    ['Home', 1],
    ['Insert', 1],
  ],
  [
    ['`', 1],
    ['1', 1],
    ['2', 1],
    ['3', 1],
    ['4', 1],
    ['5', 1],
    ['6', 1],
    ['7', 1],
    ['8', 1],
    ['9', 1],
    ['0', 1],
    ['-', 1],
    ['=', 1],
    ['Backspace', 2],
    ['PageUp', 1],
  ],
  [
    ['Tab', 1.5],
    ['q', 1],
    ['w', 1],
    ['e', 1],
    ['r', 1],
    ['t', 1],
    ['y', 1],
    ['u', 1],
    ['i', 1],
    ['o', 1],
    ['p', 1],
    ['[', 1],
    [']', 1],
    ['\\', 1.5],
    ['PageDown', 1],
  ],
  [
    ['CapsLock', 1.75],
    ['a', 1],
    ['s', 1],
    ['d', 1],
    ['f', 1],
    ['g', 1],
    ['h', 1],
    ['j', 1],
    ['k', 1],
    ['l', 1],
    [';', 1],
    ["'", 1],
    ['Enter', 2.25],
    ['End', 1],
  ],
  [
    ['Shift', 2.25],
    ['z', 1],
    ['x', 1],
    ['c', 1],
    ['v', 1],
    ['b', 1],
    ['n', 1],
    ['m', 1],
    [',', 1],
    ['.', 1],
    ['/', 1],
    ['ShiftRight', 1.75],
    ['ArrowUp', 1],
    ['Fn2', 1],
  ],
  [
    ['Control', 1.25],
    ['Meta', 1.25],
    ['Alt', 1.25],
    [' ', 6.25],
    ['AltRight', 1],
    ['Fn', 1],
    ['ControlRight', 1],
    ['ArrowLeft', 1],
    ['ArrowDown', 1],
    ['ArrowRight', 1],
  ],
];

const ACCENT = new Set(['Escape', 'Enter']);
const MOD = new Set([
  'Tab',
  'CapsLock',
  'Shift',
  'ShiftRight',
  'Control',
  'Meta',
  'Alt',
  'AltRight',
  'Fn',
  'Fn2',
  'ControlRight',
  'Backspace',
  '\\',
  'Delete',
  'Home',
  'Insert',
  'PageUp',
  'PageDown',
  'End',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
]);

interface KeyDef {
  label: string;
  width: number;
  x: number;
  z: number;
  color: THREE.Color;
}

const colAlpha = new THREE.Color('#2a2d33');
const colMod = new THREE.Color('#4b5058');
const colAccent = new THREE.Color('#b9bec6');
const colHover = new THREE.Color('#f4f5f7');
const dummy = new THREE.Object3D();
const tmpColor = new THREE.Color();

function layout() {
  const keys: KeyDef[] = [];
  const width = 16 * U;
  ROWS.forEach((row, r) => {
    let x = -width / 2;
    const z = (r - 2.5) * U + (r === 0 ? -U * 0.2 : 0); // a small gap under the F-row
    for (const [label, w] of row) {
      const color = ACCENT.has(label) ? colAccent : MOD.has(label) ? colMod : colAlpha;
      keys.push({ label, width: w, x: x + (w * U) / 2, z, color });
      x += w * U;
    }
  });
  return keys;
}

/**
 * Mechanical keyboard with individually modelled caps, drawn as one instanced
 * mesh per cap width. Caps light up under the pointer and dip when the
 * portfolio terminal receives the matching keystroke.
 */
export function Keyboard() {
  const keys = useMemo(layout, []);
  const groups = useMemo(() => {
    const byWidth = new Map<number, number[]>();
    keys.forEach((k, i) => byWidth.set(k.width, [...(byWidth.get(k.width) ?? []), i]));
    return [...byWidth.entries()].map(([w, idx]) => ({ w, idx, geometry: keycap(w, U, CAP_H) }));
  }, [keys]);

  const mats = useMemo(
    () => ({
      cap: new THREE.MeshPhysicalMaterial({ roughness: 0.55, clearcoat: 0.15, clearcoatRoughness: 0.6 }),
      case: aluminium('#9ea3ab', 0.36),
      plate: plastic('#121315', 0.7),
    }),
    [],
  );
  mats.cap.userData.keepEmissive = true;
  useEffect(() => () => disposeMaterials(Object.values(mats)), [mats]);

  const meshes = useRef<(THREE.InstancedMesh | null)[]>([]);
  const press = useRef(new Float32Array(keys.length)); // 0..1 key travel
  const glow = useRef(new Float32Array(keys.length));
  const hoverKey = useRef<number>(-1);
  const keyboardHovered = useStore((s) => s.hovered === 'keyboard');
  const pulse = useStore((s) => s.keyPulse);

  // Map a typed key to a cap and press it.
  useEffect(() => {
    if (!pulse.n) return;
    const k = pulse.key.length === 1 ? pulse.key.toLowerCase() : pulse.key;
    const i = keys.findIndex((d) => d.label === k);
    if (i >= 0) press.current[i] = 1;
  }, [pulse, keys]);

  useFrame((_, dt) => {
    const p = press.current;
    const g = glow.current;
    for (const grp of groups) {
      const mesh = meshes.current[groups.indexOf(grp)];
      if (!mesh) continue;
      grp.idx.forEach((ki, j) => {
        const k = keys[ki];
        p[ki] = Math.max(0, p[ki] - dt * 5);
        const hoverTarget = ki === hoverKey.current ? 1 : keyboardHovered ? 0.18 : 0;
        g[ki] = THREE.MathUtils.damp(g[ki], Math.max(hoverTarget, p[ki]), 12, dt);
        const travel = Math.sin(Math.min(1, p[ki]) * Math.PI) * 0.0028 + p[ki] * 0.0006;
        dummy.position.set(k.x, 0.0105 - travel, k.z);
        dummy.updateMatrix();
        mesh.setMatrixAt(j, dummy.matrix);
        tmpColor.copy(k.color).lerp(colHover, g[ki] * 0.32);
        mesh.setColorAt(j, tmpColor);
      });
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  });

  const onMove = (gi: number) => (e: ThreeEvent<PointerEvent>) => {
    if (e.instanceId === undefined) return;
    hoverKey.current = groups[gi].idx[e.instanceId];
  };
  const onLeave = () => {
    hoverKey.current = -1;
  };

  const caseW = 16 * U + 0.012;
  const caseD = 6 * U + 0.016;

  return (
    <group>
      <mesh geometry={roundedBox(caseW, 0.012, caseD, 0.004)} material={mats.case} position={[0, 0.006, -U * 0.1]} castShadow receiveShadow />
      <mesh material={mats.plate} position={[0, 0.0122, -U * 0.1]}>
        <boxGeometry args={[caseW - 0.008, 0.0006, caseD - 0.008]} />
      </mesh>
      {groups.map((grp, gi) => (
        <instancedMesh
          key={grp.w}
          ref={(m) => {
            meshes.current[gi] = m;
            if (m && !m.instanceColor) {
              grp.idx.forEach((ki, j) => {
                dummy.position.set(keys[ki].x, 0.0105, keys[ki].z);
                dummy.updateMatrix();
                m.setMatrixAt(j, dummy.matrix);
                m.setColorAt(j, keys[ki].color);
              });
              m.computeBoundingSphere();
            }
          }}
          args={[grp.geometry, mats.cap, grp.idx.length]}
          castShadow
          onPointerMove={onMove(gi)}
          onPointerOut={onLeave}
        />
      ))}
    </group>
  );
}
