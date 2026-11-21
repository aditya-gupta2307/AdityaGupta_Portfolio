import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { rig, pointer, type CameraState } from './bridge';
import { focusKeyframes } from './keyframes';
import { useStore } from '../../state/store';

const target = new THREE.Vector3();
const lookAt = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

/**
 * Moves the camera toward the state written by the scroll timeline (or a
 * clicked object's close-up), with critically-damped smoothing, a little
 * pointer parallax and a barely-there idle drift.
 */
export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const focus = useStore((s) => s.focus);
  const focusKF = useMemo(() => focusKeyframes(size.width / size.height), [size.width, size.height]);
  const cur = useRef<CameraState>({ ...rig });
  const smoothPointer = useRef({ x: 0, y: 0 });
  const first = useRef(true);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const goal = (focus && focusKF[focus]) || rig;
    const c = cur.current;
    const lambda = focus ? 3.2 : 5.5;
    const keys = Object.keys(goal) as (keyof CameraState)[];
    for (const k of keys) {
      c[k] = reducedMotion || first.current ? goal[k] : THREE.MathUtils.damp(c[k], goal[k], lambda, dt);
    }
    first.current = false;

    const sp = smoothPointer.current;
    sp.x = THREE.MathUtils.damp(sp.x, reducedMotion ? 0 : pointer.x, 3, dt);
    sp.y = THREE.MathUtils.damp(sp.y, reducedMotion ? 0 : pointer.y, 3, dt);
    const t = state.clock.elapsedTime;
    const idle = reducedMotion ? 0 : 1;
    const par = c.parallax;

    target.set(c.px, c.py, c.pz);
    // Parallax moves the camera on a small arc around what it looks at.
    target.x += sp.x * 0.07 * par + Math.sin(t * 0.21) * 0.004 * idle;
    target.y += -sp.y * 0.035 * par + Math.sin(t * 0.17 + 1) * 0.003 * idle;
    camera.position.copy(target);
    lookAt.set(c.tx + sp.x * 0.012 * par, c.ty - sp.y * 0.008 * par, c.tz);

    if (Math.abs(camera.fov - c.fov) > 1e-3) {
      camera.fov = c.fov;
      camera.updateProjectionMatrix();
    }

    // Framing shift: aim slightly beside the subject so it sits off-centre
    // and leaves room for text. (A true lens shift via setViewOffset would
    // misplace the HTML screen, which assumes a centred projection.)
    if (c.shiftX || c.shiftY) {
      forward.subVectors(lookAt, target);
      const d = forward.length();
      forward.normalize();
      right.crossVectors(forward, WORLD_UP).normalize();
      up.crossVectors(right, forward).normalize();
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * d;
      const halfW = halfH * camera.aspect;
      lookAt.addScaledVector(right, -c.shiftX * 2 * halfW);
      lookAt.addScaledVector(up, -c.shiftY * 2 * halfH);
    }
    camera.lookAt(lookAt);
  }, -1);

  return null;
}
