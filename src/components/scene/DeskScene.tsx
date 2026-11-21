import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei/core/PerformanceMonitor';
import * as THREE from 'three';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Keyboard } from './Keyboard';
import { Mouse, Mug, Headphones, Lamp } from './DeskObjects';
import { F1Car } from './F1Car';
import { PurdueCorner, Notebook, PuzzleCube } from './StudyCorner';
import { Lights } from './Lights';
import { CameraRig } from './CameraRig';
import { Interactive } from './Interactive';
import { activateDeskObject } from './actions';
import { deskObject } from '../../data/deskObjects';
import { setState, useStore, type DeskObjectId } from '../../state/store';
import { rig } from './bridge';
import { ScreenView } from '../workspace/ScreenView';

interface Props {
  quality: 'high' | 'low';
  reducedMotion: boolean;
}

function Obj({ id, children, ...rest }: { id: DeskObjectId; children: React.ReactNode; position?: [number, number, number]; rotation?: [number, number, number]; labelOffset?: [number, number, number]; lift?: number }) {
  const o = deskObject(id);
  const lampOn = useStore((s) => s.lampOn);
  const hint = id === 'lamp' ? (lampOn ? 'Click to switch it off' : 'Click to switch it on') : o.hint;
  return (
    <Interactive id={id} label={o.label} hint={hint} onActivate={() => activateDeskObject(id)} {...rest}>
      {children}
    </Interactive>
  );
}

function CarSlot() {
  const active = useStore((s) => (s.hovered === 'car' || s.focus === 'car' ? 1 : 0));
  return <F1Car active={active} />;
}

function Ready() {
  useEffect(() => {
    setState({ sceneReady: true });
    // Power the monitor on shortly after the first frame.
    const t = window.setTimeout(() => setState({ screenOn: true }), 450);
    return () => window.clearTimeout(t);
  }, []);
  return null;
}

/** The whole 3D desk: canvas, lights, camera and every object on the desk. */
export default function DeskScene({ quality, reducedMotion }: Props) {
  const covered = useStore((s) => s.panelVisible);
  const paused = useStore((s) => s.canvasPaused);
  const [dpr, setDpr] = useState<number>(quality === 'high' ? Math.min(2, window.devicePixelRatio) : Math.min(1.5, window.devicePixelRatio));
  const shadows = true;
  const mapSize = quality === 'high' ? 2048 : 1024;

  return (
    <Canvas
      className="desk-canvas"
      dpr={dpr}
      frameloop={paused ? 'never' : 'always'}
      shadows={shadows ? 'soft' : false}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: rig.fov, near: 0.02, far: 30, position: [rig.px, rig.py, rig.pz] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.background = new THREE.Color('#08090b');
        scene.fog = new THREE.Fog('#08090b', 2.6, 7.5);
      }}
      onPointerMissed={() => setState({ hovered: null })}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1, d - 0.5))} flipflops={2} />
      <CameraRig reducedMotion={reducedMotion} />
      <Lights shadows={shadows} mapSize={mapSize} />

      <Suspense fallback={null}>
        <Desk quality={quality} />

        <Obj id="monitor" lift={0} labelOffset={[0, 0.56, -0.19]}>
          <Monitor screen={<ScreenView />} screenHidden={covered} reducedMotion={reducedMotion} />
        </Obj>

        <Obj id="keyboard" position={[-0.05, 0.003, 0.1]} labelOffset={[0, 0.07, 0]} lift={0.003}>
          <Keyboard />
        </Obj>

        <Obj id="mouse" position={[0.27, 0.003, 0.13]} rotation={[0, -0.12, 0]} labelOffset={[0, 0.07, 0]}>
          <Mouse />
        </Obj>

        <Obj id="car" position={[0.4, 0, -0.08]} rotation={[0, -0.62, 0]} labelOffset={[0, 0.12, 0]} lift={0.004}>
          <CarSlot />
        </Obj>

        <Obj id="mug" position={[0.62, 0, 0.16]} labelOffset={[0, 0.16, 0]}>
          <Mug />
        </Obj>

        <Obj id="cube" position={[0.64, 0, -0.24]} labelOffset={[0, 0.12, 0]}>
          <PuzzleCube />
        </Obj>

        <Obj id="lamp" position={[-0.68, 0, -0.26]} rotation={[0, -0.35, 0]} labelOffset={[0.2, 0.46, 0.02]} lift={0}>
          <Lamp shadows={quality === 'high'} />
        </Obj>

        <Obj id="headphones" position={[-0.62, 0, 0.08]} labelOffset={[0, 0.34, 0]} lift={0.003}>
          <Headphones />
        </Obj>

        <Obj id="purdue" position={[-0.37, 0, -0.24]} rotation={[0, 0.12, 0]} labelOffset={[0, 0.16, 0.08]} lift={0.004}>
          <PurdueCorner />
        </Obj>

        <group position={[-0.37, 0, 0.21]} rotation={[0, 0.32, 0]}>
          <Notebook />
        </group>

        <Ready />
      </Suspense>
    </Canvas>
  );
}
