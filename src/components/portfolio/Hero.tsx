import { profile } from '../../data/profile';
import { goTo } from '../../state/store';
import { Icon } from '../ui/Icon';
import { DeskHints } from './DeskHints';

/** Scene 1: who this is, in one glance, beside the desk. */
export function Hero({ has3D }: { has3D: boolean }) {
  return (
    <section id="hero" className="section hero" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow reveal" style={{ ['--d' as string]: '0ms' }}>
            {profile.year} · Purdue University
          </p>
          <h1 id="hero-title" className="hero__title reveal" style={{ ['--d' as string]: '80ms' }}>
            {profile.name}
          </h1>
          <p className="hero__role reveal" style={{ ['--d' as string]: '160ms' }}>
            {profile.role}
          </p>
          <p className="hero__intro reveal" style={{ ['--d' as string]: '240ms' }}>
            {profile.intro}
          </p>
          <div className="hero__actions reveal" style={{ ['--d' as string]: '320ms' }}>
            <a className="btn btn--primary" href="#projects" onClick={(e) => (e.preventDefault(), goTo('projects'))}>
              Explore projects <Icon name="arrow" />
            </a>
            <a className="btn" href={profile.links.resume} target="_blank" rel="noopener noreferrer">
              <Icon name="file" /> Resume
            </a>
          </div>
          {has3D && <DeskHints />}
        </div>
      </div>
      <a className="hero__scroll" href="#approach" onClick={(e) => (e.preventDefault(), goTo('approach'))}>
        <span>Scroll to step inside</span>
        <Icon name="chevronDown" size={16} />
      </a>
    </section>
  );
}

/** Scene 2: the camera approaches the monitor. */
export function Approach() {
  return (
    <section id="approach" className="section approach" aria-labelledby="approach-title">
      <div className="container approach__inner">
        <p className="eyebrow">The workspace</p>
        <h2 id="approach-title" className="approach__title">
          The screen is a working desktop.
        </h2>
        <p className="approach__text">
          Open windows, run commands in the terminal or browse the project dashboard. Keep scrolling to step inside — or{' '}
          <a href="#projects" onClick={(e) => (e.preventDefault(), goTo('projects'))}>
            skip straight to the projects
          </a>
          .
        </p>
        <ul className="approach__modes" aria-label="Workspace modes">
          <li>
            <Icon name="desktop" /> Desktop
          </li>
          <li>
            <Icon name="terminal" /> Terminal
          </li>
          <li>
            <Icon name="grid" /> Dashboard
          </li>
        </ul>
      </div>
    </section>
  );
}
