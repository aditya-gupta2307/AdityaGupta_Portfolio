import { useEffect, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import { setState, useStore, getState, type DeskObjectId } from '../../state/store';
import { meshesOf } from './materials';

interface Props {
  id: DeskObjectId;
  label: string;
  hint: string;
  onActivate: () => void;
  labelOffset?: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** Lift on hover, in metres. */
  lift?: number;
  children: ReactNode;
}

const tmp = new THREE.Color();

/**
 * Wraps a desk object with hover + click behaviour: a gentle lift, a faint
 * glow, the pointer cursor and a floating label. The same highlight is shown
 * when the matching HTML button outside the canvas has keyboard focus.
 */
export function Interactive({ id, label, hint, onActivate, labelOffset = [0, 0.12, 0], position, rotation, lift = 0.006, children }: Props) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const hovered = useStore((s) => s.hovered === id);
  const amount = useRef(0);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);

  useEffect(() => {
    if (!inner.current) return;
    const list: THREE.MeshStandardMaterial[] = [];
    for (const m of meshesOf(inner.current)) {
      const arr = Array.isArray(m.material) ? m.material : [m.material];
      for (const mat of arr) {
        const sm = mat as THREE.MeshStandardMaterial;
        if (sm.emissive && !list.includes(sm) && !sm.userData.keepEmissive) list.push(sm);
      }
    }
    mats.current = list;
  }, []);

  useFrame((_, dt) => {
    const target = hovered ? 1 : 0;
    amount.current = THREE.MathUtils.damp(amount.current, target, 10, dt);
    const a = amount.current;
    if (inner.current) inner.current.position.y = a * lift;
    tmp.setRGB(0.09 * a, 0.095 * a, 0.1 * a);
    for (const m of mats.current) m.emissive.copy(tmp);
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setState({ hovered: id });
    document.body.style.cursor = 'pointer';
  };
  const out = () => {
    if (getState().hovered === id) setState({ hovered: null });
    document.body.style.cursor = '';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onActivate();
  };

  return (
    <group ref={group} position={position} rotation={rotation} onPointerOver={over} onPointerOut={out} onClick={click}>
      <group ref={inner}>{children}</group>
      <Html position={labelOffset} center zIndexRange={[30, 20]} style={{ pointerEvents: 'none' }}>
        <div className="desk-label" data-visible={hovered}>
          <strong>{label}</strong>
          <span>{hint}</span>
        </div>
      </Html>
    </group>
  );
}
