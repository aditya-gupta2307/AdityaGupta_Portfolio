import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from 'react';
import { closeApp, focusApp, type AppId } from '../../state/store';
import { Icon, type IconName } from '../ui/Icon';

interface Props {
  id: AppId;
  title: string;
  icon: IconName;
  index: number;
  active: boolean;
  z: number;
  interactive: boolean;
  children: ReactNode;
}

/**
 * A desktop window: drag by its title bar (on wide screens), click to bring
 * forward, Escape or the close button to dismiss. On narrow screens windows
 * become full-size sheets and dragging is disabled.
 */
export function Window({ id, title, icon, index, active, z, interactive, children }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!interactive || !active) return;
    ref.current?.focus({ preventScroll: true });
  }, [active, interactive]);

  const onDown = (e: RPointerEvent) => {
    if (!interactive || e.button !== 0 || window.matchMedia('(max-width: 720px)').matches) return;
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    setPos({ x: d.px + e.clientX - d.x, y: d.py + e.clientY - d.y });
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <section
      ref={ref}
      className="win"
      data-active={active}
      data-app={id}
      style={{ zIndex: z, ['--i' as string]: index, transform: `translate(${pos.x}px, ${pos.y}px)` }}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      tabIndex={-1}
      onPointerDown={() => interactive && focusApp(id)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && interactive) {
          e.stopPropagation();
          closeApp(id);
        }
      }}
    >
      <header className="win__bar" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <span className="win__title">
          <Icon name={icon} size={15} />
          {title}
        </span>
        <button type="button" className="win__close" onClick={() => closeApp(id)} aria-label={`Close ${title}`} tabIndex={interactive ? 0 : -1}>
          <Icon name="close" size={14} />
        </button>
      </header>
      <div className="win__body">{children}</div>
    </section>
  );
}
