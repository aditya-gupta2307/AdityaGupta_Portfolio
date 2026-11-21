import { useSyncExternalStore } from 'react';

/**
 * A tiny shared store that both the React UI and the 3D scene read.
 * (React context would re-render the whole Canvas tree on every change.)
 */

export type SceneId = 'hero' | 'approach' | 'workspace' | 'projects' | 'skills' | 'about' | 'resume' | 'contact';
export type WorkspaceMode = 'desktop' | 'terminal' | 'dashboard';
export type AppId = 'projects' | 'undercut' | 'about' | 'skills' | 'resume' | 'contact';
export type DeskObjectId = 'monitor' | 'keyboard' | 'mouse' | 'car' | 'mug' | 'headphones' | 'purdue' | 'cube' | 'lamp';

export interface UIState {
  scene: SceneId;
  /** Desk object under the pointer or keyboard focus. */
  hovered: DeskObjectId | null;
  /** Object the camera is flying to, overriding the scroll timeline. */
  focus: DeskObjectId | null;
  screenOn: boolean;
  sceneReady: boolean;
  lampOn: boolean;
  mode: WorkspaceMode;
  windows: AppId[];
  activeWindow: AppId | null;
  /** Incremented on every terminal keystroke; the 3D keyboard animates it. */
  keyPulse: { key: string; n: number };
  cubeTurns: number;
  mugTurns: number;
}

let state: UIState = {
  scene: 'hero',
  hovered: null,
  focus: null,
  screenOn: false,
  sceneReady: false,
  lampOn: true,
  mode: 'desktop',
  windows: [],
  activeWindow: null,
  keyPulse: { key: '', n: 0 },
  cubeTurns: 0,
  mugTurns: 0,
};

const listeners = new Set<() => void>();

export function getState() {
  return state;
}

export function setState(patch: Partial<UIState> | ((s: UIState) => Partial<UIState>)) {
  const next = typeof patch === 'function' ? patch(state) : patch;
  let changed = false;
  for (const k in next) {
    if ((next as Record<string, unknown>)[k] !== (state as unknown as Record<string, unknown>)[k]) {
      changed = true;
      break;
    }
  }
  if (!changed) return;
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: UIState) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

/* ---------- actions ---------- */

export function openApp(id: AppId) {
  setState((s) => ({
    mode: 'desktop',
    windows: s.windows.includes(id) ? [...s.windows.filter((w) => w !== id), id] : [...s.windows, id],
    activeWindow: id,
  }));
}

export function closeApp(id: AppId) {
  setState((s) => {
    const windows = s.windows.filter((w) => w !== id);
    return { windows, activeWindow: windows[windows.length - 1] ?? null };
  });
}

export function focusApp(id: AppId) {
  setState((s) => ({ windows: [...s.windows.filter((w) => w !== id), id], activeWindow: id }));
}

export function pulseKey(key: string) {
  setState((s) => ({ keyPulse: { key, n: s.keyPulse.n + 1 } }));
}

/** Smooth-scroll to a section id, respecting reduced motion. */
export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (history.replaceState) history.replaceState(null, '', `#${id}`);
}

/** Bring the visitor into the full-screen workspace, optionally in a mode/app. */
export function enterWorkspace(opts: { mode?: WorkspaceMode; app?: AppId } = {}) {
  if (opts.app) openApp(opts.app);
  else if (opts.mode) setState({ mode: opts.mode });
  goTo('workspace-open');
}
