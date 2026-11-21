import { useEffect, useState } from 'react';
import { openApp, setState, useStore, goTo, type AppId, type WorkspaceMode } from '../../state/store';
import { profile } from '../../data/profile';
import { APPS, AppContent } from './apps';
import { Window } from './Window';
import { Terminal } from './Terminal';
import { Dashboard } from './Dashboard';
import { Icon, type IconName } from '../ui/Icon';

const MODES: { id: WorkspaceMode; label: string; icon: IconName }[] = [
  { id: 'desktop', label: 'Desktop', icon: 'desktop' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
];

const DESKTOP_ICONS: { id: AppId | 'terminal'; label: string; icon: IconName }[] = [
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'undercut', label: 'Undercut', icon: 'flag' },
  { id: 'about', label: 'About', icon: 'user' },
  { id: 'skills', label: 'Skills', icon: 'layers' },
  { id: 'resume', label: 'Resume', icon: 'file' },
  { id: 'terminal', label: 'Terminal', icon: 'terminal' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
];

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return <time dateTime={now.toISOString()}>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>;
}

function Desktop({ interactive }: { interactive: boolean }) {
  const windows = useStore((s) => s.windows);
  const active = useStore((s) => s.activeWindow);
  const t = interactive ? 0 : -1;

  return (
    <div className="desk">
      <div className="desk__hello" aria-hidden={windows.length > 0}>
        <p className="desk__eyebrow">
          {profile.year} · {profile.location}
        </p>
        <h2 className="desk__name">{profile.name}</h2>
        <p className="desk__role">{profile.role}</p>
      </div>

      <nav className="desk__icons" aria-label="Desktop apps">
        {DESKTOP_ICONS.map((d) => (
          <button
            key={d.id}
            type="button"
            className="desk__icon"
            data-app={d.id}
            tabIndex={t}
            onClick={() => (d.id === 'terminal' ? setState({ mode: 'terminal' }) : openApp(d.id))}
          >
            <span className="desk__glyph">
              <Icon name={d.icon} size={26} />
            </span>
            <span className="desk__label">{d.label}</span>
          </button>
        ))}
      </nav>

      <div className="desk__windows">
        {windows.map((w, i) => (
          <Window key={w} id={w} title={APPS[w].title} icon={APPS[w].icon} index={i} z={10 + i} active={active === w} interactive={interactive}>
            <AppContent id={w} />
          </Window>
        ))}
      </div>
    </div>
  );
}

/**
 * The personal workspace shown on the monitor. The same component renders on
 * the 3D screen (`variant="screen"`, inert) and as the full-screen interface
 * the visitor scrolls into (`variant="full"`), so the two match exactly at
 * the handoff.
 */
export function Workspace({ variant }: { variant: 'screen' | 'full' }) {
  const mode = useStore((s) => s.mode);
  const interactive = variant === 'full';
  const t = interactive ? 0 : -1;

  return (
    <div className={`ws ws--${variant}`} data-mode={mode}>
      <header className="ws__bar">
        <div className="ws__brand">
          <span className="ws__mono" aria-hidden="true">
            AG
          </span>
          <span>Workspace</span>
        </div>
        <div className="seg ws__modes" role="tablist" aria-label="Workspace mode">
          {MODES.map((m) => (
            <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} tabIndex={t} onClick={() => setState({ mode: m.id })}>
              <Icon name={m.icon} size={15} />
              <span>{m.label}</span>
            </button>
          ))}
        </div>
        <div className="ws__status">
          <Clock />
          {interactive && (
            <button type="button" className="ws__exit" onClick={() => goTo('projects')}>
              Continue <Icon name="chevronDown" size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="ws__body" role={interactive ? 'tabpanel' : undefined}>
        {mode === 'desktop' && <Desktop interactive={interactive} />}
        {mode === 'terminal' && <Terminal interactive={interactive} />}
        {mode === 'dashboard' && <Dashboard interactive={interactive} />}
      </div>
    </div>
  );
}
