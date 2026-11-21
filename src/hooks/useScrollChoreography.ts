import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { rig } from '../components/scene/bridge';
import { sceneKeyframes, SCENE_ORDER } from '../components/scene/keyframes';
import { getState, setState, subscribe, type SceneId } from '../state/store';

gsap.registerPlugin(ScrollTrigger);

const docTop = (el: HTMLElement) => el.getBoundingClientRect().top + window.scrollY;

/**
 * Drives the 3D camera from the page scroll.
 *
 * One scrubbed GSAP timeline spans the whole document; its time is measured
 * in scroll pixels, so each camera move sits exactly where its section enters
 * the viewport and every move reverses cleanly when scrolling back up.
 * With reduced motion, the camera cuts between framings instead of moving.
 */
export function useScrollChoreography(reducedMotion: boolean) {
  useEffect(() => {
    let tl: gsap.core.Timeline | null = null;
    const sectionTriggers: ScrollTrigger[] = [];

    const build = () => {
      tl?.scrollTrigger?.kill();
      tl?.kill();
      tl = null;
      const vh = window.innerHeight;
      const KF = sceneKeyframes(window.innerWidth / vh);
      if (reducedMotion) {
        Object.assign(rig, KF[getState().scene]);
        return;
      }
      const max = ScrollTrigger.maxScroll(window);
      Object.assign(rig, KF.hero);
      tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { start: 0, end: () => ScrollTrigger.maxScroll(window), scrub: 0.35 },
      });
      tl.set({}, {}, Math.max(1, max));

      SCENE_ORDER.forEach((id, i) => {
        if (i === 0) return;
        const el = document.getElementById(id);
        if (!el) return;
        const top = docTop(el);
        let start = top - vh * 0.95;
        let end = top - vh * 0.1;
        if (id === 'approach') {
          start = 0;
          end = Math.max(vh * 0.6, top + vh * 0.2);
        }
        if (id === 'workspace') {
          start = top - vh;
          end = top; // arrive exactly as the workspace pins
        }
        if (id === 'projects') {
          start = top - vh;
          end = top - vh * 0.15;
        }
        start = Math.max(0, start);
        end = Math.max(start + 1, end);
        const prev = KF[SCENE_ORDER[i - 1]];
        tl!.fromTo(rig, { ...prev }, { ...KF[id], duration: end - start, immediateRender: false }, start);
      });
    };

    // Which section is "current", for the nav and scene details.
    SCENE_ORDER.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      sectionTriggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setState({ scene: id as SceneId });
          },
        }),
      );
    });

    build();

    let t = 0;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 200);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('load', onResize);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    // Reduced motion: cut to each section's framing as it becomes current.
    let lastScene = getState().scene;
    const unsub = subscribe(() => {
      const s = getState().scene;
      if (s === lastScene) return;
      lastScene = s;
      if (reducedMotion) Object.assign(rig, sceneKeyframes(window.innerWidth / window.innerHeight)[s]);
    });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('load', onResize);
      ro.disconnect();
      window.clearTimeout(t);
      unsub();
      tl?.scrollTrigger?.kill();
      tl?.kill();
      sectionTriggers.forEach((s) => s.kill());
    };
  }, [reducedMotion]);
}
