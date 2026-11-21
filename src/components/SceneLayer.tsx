import { Component, lazy, Suspense, type ReactNode } from 'react';
import { useStore } from '../state/store';

const DeskScene = lazy(() => import('./scene/DeskScene'));

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * The fixed 3D layer behind the page. The scene's code is split into its own
 * chunk, so the text content renders first; if WebGL is missing or the scene
 * fails, the page falls back to a still backdrop and keeps working.
 */
export function SceneLayer({ has3D, quality, reducedMotion, onFail }: { has3D: boolean; quality: 'high' | 'low'; reducedMotion: boolean; onFail: () => void }) {
  const ready = useStore((s) => s.sceneReady);
  return (
    <div className="scene-layer" data-ready={ready || !has3D} aria-hidden="true">
      {has3D ? (
        <SceneBoundary onError={onFail}>
          <Suspense fallback={null}>
            <DeskScene quality={quality} reducedMotion={reducedMotion} />
          </Suspense>
        </SceneBoundary>
      ) : (
        <div className="scene-fallback" />
      )}
      <div className="scene-layer__veil" />
    </div>
  );
}
