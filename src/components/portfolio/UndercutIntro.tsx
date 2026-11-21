import { useEffect, useRef } from 'react';
import { setState, useStore } from '../../state/store';
import { undercut } from '../../data/projects';
import { ProjectLinks } from '../ui/ProjectLinks';
import { Icon } from '../ui/Icon';

/**
 * Shown when the model car is clicked: the camera flies to the car and this
 * card introduces Undercut. Scrolling, Escape or "Back to the desk" closes it.
 */
export function UndercutIntro() {
  const open = useStore((s) => s.focus === 'car');
  const card = useRef<HTMLDivElement>(null);
  const returnTo = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement;
    const y0 = window.scrollY;
    const t = window.setTimeout(() => card.current?.focus({ preventScroll: true }), 350);
    const close = () => setState({ focus: null });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onScroll = () => Math.abs(window.scrollY - y0) > 120 && close();
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll);
      (returnTo.current as HTMLElement | null)?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <div className="uc-intro" data-open={open} aria-hidden={!open}>
      <div ref={card} className="uc-intro__card" role="dialog" aria-modal="false" aria-labelledby="uc-intro-title" tabIndex={-1}>
        <p className="uc-intro__kicker">
          <span className="uc-intro__light" aria-hidden="true" /> Flagship project
        </p>
        <h2 id="uc-intro-title" className="uc-intro__title">
          Undercut
        </h2>
        <p className="uc-intro__tag">{undercut.tagline}</p>
        <p className="uc-intro__text">{undercut.problem}</p>
        <ul className="uc-intro__facts">
          <li>
            <strong>20,000</strong>
            <span>race simulations</span>
          </li>
          <li>
            <strong>8,000</strong>
            <span>season simulations</span>
          </li>
          <li>
            <strong>3</strong>
            <span>public data sources</span>
          </li>
        </ul>
        {open && <ProjectLinks project={undercut} accent />}
        <button type="button" className="uc-intro__back" onClick={() => setState({ focus: null })} tabIndex={open ? 0 : -1}>
          <Icon name="close" size={14} /> Back to the desk
        </button>
      </div>
    </div>
  );
}
