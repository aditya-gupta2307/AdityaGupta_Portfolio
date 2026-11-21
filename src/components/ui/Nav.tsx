import { useEffect, useState } from 'react';
import { goTo, useStore, type SceneId } from '../../state/store';
import { profile } from '../../data/profile';
import { Icon } from './Icon';

const LINKS: { id: string; label: string; scenes: SceneId[] }[] = [
  { id: 'workspace-open', label: 'Workspace', scenes: ['workspace'] },
  { id: 'projects', label: 'Projects', scenes: ['projects'] },
  { id: 'skills', label: 'Skills', scenes: ['skills'] },
  { id: 'about', label: 'About', scenes: ['about'] },
  { id: 'contact', label: 'Contact', scenes: ['contact'] },
];

export function Nav() {
  const scene = useStore((s) => s.scene);
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    goTo(id);
  };

  return (
    <header className="nav" data-solid={solid || open}>
      <nav className="nav__inner" aria-label="Primary">
        <a href="#hero" className="nav__logo" onClick={go('hero')}>
          {profile.name}
          <span>CS @ Purdue</span>
        </a>
        <button
          type="button"
          className="nav__burger"
          aria-expanded={open}
          aria-controls="nav-links"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
        <ul className="nav__links" id="nav-links" data-open={open}>
          {LINKS.map((l) => (
            <li key={l.id}>
              <a href={`#${l.id}`} aria-current={l.scenes.includes(scene) ? 'true' : undefined} onClick={go(l.id)}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a className="nav__resume" href={profile.links.resume} target="_blank" rel="noopener noreferrer">
              Resume
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
