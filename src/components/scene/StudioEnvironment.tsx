import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

export interface Panel {
  shape?: 'rect' | 'ring';
  size: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  intensity: number;
}

/**
 * A procedural reflection environment: a few glowing panels in a dark room,
 * pre-filtered once with PMREM. Gives metal and glass something to reflect
 * without downloading an HDR file (or bundling the loaders for one).
 */
export function StudioEnvironment({ panels, background = '#060708' }: { panels: Panel[]; background?: string }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = new THREE.Scene();
    env.background = new THREE.Color(background);
    const disposables: { dispose: () => void }[] = [];

    for (const p of panels) {
      const geometry = p.shape === 'ring' ? new THREE.RingGeometry(p.size[0] * 0.42, p.size[0] * 0.5, 48) : new THREE.PlaneGeometry(p.size[0], p.size[1]);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(p.color ?? '#ffffff').multiplyScalar(p.intensity),
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...p.position);
      if (p.rotation) mesh.rotation.set(...p.rotation);
      env.add(mesh);
      disposables.push(geometry, material);
    }

    const target = pmrem.fromScene(env, 0.02);
    const previous = scene.environment;
    scene.environment = target.texture;

    return () => {
      scene.environment = previous;
      target.dispose();
      pmrem.dispose();
      disposables.forEach((d) => d.dispose());
    };
    // Panels are static for the lifetime of the scene.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene]);

  return null;
}
