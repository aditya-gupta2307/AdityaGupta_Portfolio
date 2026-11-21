import type { SceneId, DeskObjectId } from '../../state/store';
import { SCREEN, type CameraState } from './bridge';

type KF = CameraState;

const base: Omit<KF, 'px' | 'py' | 'pz' | 'tx' | 'ty' | 'tz'> = {
  fov: 32,
  shiftX: 0,
  shiftY: 0,
  lamp: 1,
  parallax: 0.5,
};

function kf(p: [number, number, number], t: [number, number, number], extra: Partial<KF> = {}): KF {
  return { ...base, px: p[0], py: p[1], pz: p[2], tx: t[0], ty: t[1], tz: t[2], ...extra };
}

/** Distance at which the monitor screen fills `fill` of the viewport. */
function screenFillDistance(aspect: number, fovDeg: number, fill: number) {
  const t = Math.tan((fovDeg * Math.PI) / 360);
  const byHeight = SCREEN.height / (2 * t * fill);
  const byWidth = SCREEN.width / (2 * t * aspect * fill);
  return Math.max(byHeight, byWidth);
}

/**
 * Camera keyframes for each scroll section. Portrait screens get their own
 * framing rather than a squeezed desktop shot.
 */
export function sceneKeyframes(aspect: number): Record<SceneId, KF> {
  const [sx, sy, sz] = SCREEN.center;
  const portrait = aspect < 0.95;
  const enterFov = 32;
  const enterD = screenFillDistance(aspect, enterFov, portrait ? 0.96 : 0.9);

  if (portrait) {
    return {
      hero: kf([0.95, 1.05, 2.75], [0.02, 0.16, -0.05], { fov: 34, shiftY: 0.16, parallax: 0.6 }),
      approach: kf([0.3, 0.55, 1.35], [0, 0.3, -0.2], { fov: 34 }),
      workspace: kf([sx, sy, sz + enterD], [sx, sy, sz], { fov: enterFov, parallax: 0 }),
      projects: kf([0.82, 0.34, 0.42], [0.5, 0.04, -0.22], { fov: 34, shiftY: 0.22 }),
      skills: kf([0.1, 0.62, 0.62], [-0.04, 0, 0.08], { fov: 34, shiftY: 0.22 }),
      about: kf([-0.25, 0.45, 0.85], [-0.5, 0.1, -0.2], { fov: 34, shiftY: 0.22, lamp: 1.6 }),
      resume: kf([-0.4, 0.6, 1.3], [0, 0.3, -0.2], { fov: 34, shiftY: 0.22 }),
      contact: kf([0, 1.1, 3.1], [0, 0.18, -0.1], { fov: 34, shiftY: 0.12 }),
    };
  }

  return {
    hero: kf([1.22, 0.8, 1.52], [0.02, 0.15, -0.06], { shiftX: 0.17, parallax: 1 }),
    approach: kf([0.3, 0.5, 1.0], [0, 0.31, -0.2], { shiftY: 0.12, parallax: 0.6 }),
    workspace: kf([sx, sy, sz + enterD], [sx, sy, sz], { fov: enterFov, parallax: 0 }),
    projects: kf([0.98, 0.24, 0.3], [0.5, 0.05, -0.22], { fov: 30, shiftX: 0.24 }),
    skills: kf([0.26, 0.44, 0.52], [-0.04, 0.0, 0.07], { fov: 30, shiftX: 0.24 }),
    about: kf([-0.08, 0.36, 0.62], [-0.5, 0.12, -0.2], { fov: 32, shiftX: -0.22, lamp: 1.6 }),
    resume: kf([-0.62, 0.46, 0.86], [-0.02, 0.3, -0.2], { fov: 32, shiftX: -0.22 }),
    contact: kf([0.15, 0.9, 2.35], [0.02, 0.18, -0.1], { fov: 30, shiftX: 0.2, parallax: 0.8 }),
  };
}

/** Close-ups used when a desk object is clicked. */
export function focusKeyframes(aspect: number): Partial<Record<DeskObjectId, KF>> {
  const portrait = aspect < 0.95;
  return {
    car: portrait
      ? kf([0.66, 0.16, 0.12], [0.5, 0.03, -0.22], { fov: 34, shiftY: 0.2, parallax: 0.3 })
      : kf([0.74, 0.13, 0.04], [0.5, 0.035, -0.22], { fov: 28, shiftX: 0.22, parallax: 0.3 }),
  };
}

export const SCENE_ORDER: SceneId[] = ['hero', 'approach', 'workspace', 'projects', 'skills', 'about', 'resume', 'contact'];
