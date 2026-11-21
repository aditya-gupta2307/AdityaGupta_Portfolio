import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Workspace } from '../workspace/Workspace';
import { screenRect, SCREEN } from '../scene/bridge';
import { setState } from '../../state/store';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Scene 3: the monitor becomes the page.
 *
 * As this tall section pins, a panel holding the real, interactive workspace
 * starts exactly on top of the monitor's on-screen rectangle — laid out at
 * the same 1280×720 size and scaled to match — then grows to fill the
 * viewport while its content scale relaxes to 1. Scrolling back reverses it.
 */
export function WorkspaceSection({ has3D }: { has3D: boolean }) {
  const section = useRef<HTMLElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = section.current!;
    let progress = 0;
    let raf = 0;

    const expand = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: () => `+=${window.innerHeight * 0.55}`,
      onUpdate: (self) => {
        progress = self.progress;
      },
    });
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const p = panel.current;
      const i = inner.current;
      if (!p || !i) return;
      const top = el.getBoundingClientRect().top;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const show = top <= 1 && el.getBoundingClientRect().bottom > 0;

      const narrow = vw < 720;
      const nav = 60;
      const m = narrow ? 0 : 16;
      const to = { x: m, y: nav + (narrow ? 0 : 8), w: vw - m * 2, h: vh - nav - (narrow ? 0 : 8) - m };
      const from =
        has3D && screenRect.valid && screenRect.w > 40
          ? { x: screenRect.x, y: screenRect.y, w: screenRect.w, h: screenRect.h }
          : { x: vw * 0.1, y: vh * 0.16, w: vw * 0.8, h: vw * 0.8 * (9 / 16) };

      const t = ease(clamp01(progress));
      const x = from.x + (to.x - from.x) * t;
      const y = from.y + (to.y - from.y) * t;
      const w = from.w + (to.w - from.w) * t;
      const h = from.h + (to.h - from.h) * t;
      const k0 = from.w / SCREEN.cssWidth;
      const k = k0 + (1 - k0) * t;

      p.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      p.style.width = `${w}px`;
      p.style.height = `${h}px`;
      p.style.visibility = show ? 'visible' : 'hidden';
      p.style.borderRadius = `${(1 - t) * 3 + t * (narrow ? 0 : 18)}px`;
      i.style.width = `${w / k}px`;
      i.style.height = `${h / k}px`;
      i.style.transform = `scale(${k})`;

      setState({ panelVisible: show, canvasPaused: show && progress >= 1 });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      expand.kill();
      setState({ panelVisible: false, canvasPaused: false });
    };
  }, [has3D]);

  return (
    <section id="workspace" ref={section} className="ws-section" aria-labelledby="workspace-title">
      <h2 id="workspace-title" className="sr-only">
        Workspace: desktop, terminal and project dashboard
      </h2>
      <div className="ws-section__sticky">
        <div ref={panel} className="ws-panel">
          <div ref={inner} className="ws-panel__inner">
            <Workspace variant="full" />
          </div>
        </div>
        <p className="ws-section__hint" aria-hidden="true">
          Scroll to continue
        </p>
      </div>
      <div id="workspace-open" className="ws-section__anchor" />
    </section>
  );
}
