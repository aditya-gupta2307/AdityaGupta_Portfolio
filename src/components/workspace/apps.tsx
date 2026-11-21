import { useState } from 'react';
import { profile, education, personal, certifications } from '../../data/profile';
import { projects, undercut } from '../../data/projects';
import { skillGroups } from '../../data/skills';
import { Icon, type IconName } from '../ui/Icon';
import { goTo, setState, type AppId } from '../../state/store';
import { ProjectLinks } from '../ui/ProjectLinks';

export const APPS: Record<AppId, { title: string; icon: IconName }> = {
  projects: { title: 'Projects', icon: 'folder' },
  undercut: { title: 'Undercut', icon: 'flag' },
  about: { title: 'About', icon: 'user' },
  skills: { title: 'Skills', icon: 'layers' },
  resume: { title: 'Resume', icon: 'file' },
  contact: { title: 'Contact', icon: 'mail' },
};

function ProjectsApp() {
  const [sel, setSel] = useState(projects[0].id);
  const p = projects.find((x) => x.id === sel)!;
  return (
    <div className="app-split">
      <ul className="app-list" role="listbox" aria-label="Projects">
        {projects.map((x) => (
          <li key={x.id}>
            <button type="button" role="option" aria-selected={x.id === sel} onClick={() => setSel(x.id)}>
              <strong>{x.name}</strong>
              <span>{x.kind}</span>
            </button>
          </li>
        ))}
      </ul>
      <article className="app-detail">
        <h3>{p.name}</h3>
        <p className="app-detail__tag">{p.tagline}</p>
        <p>{p.problem}</p>
        <h4>What I built</h4>
        <ul>
          {p.built.slice(0, 4).map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <div className="chip-row">
          {p.stack.map((s) => (
            <span className="chip" key={s}>
              {s}
            </span>
          ))}
        </div>
        {p.note && <p className="muted small">{p.note}</p>}
        <ProjectLinks project={p} small />
      </article>
    </div>
  );
}

function UndercutApp() {
  return (
    <div className="app-undercut">
      <img src={undercut.image!.src} alt={undercut.image!.alt} loading="lazy" />
      <div>
        <p className="app-undercut__kicker">Flagship project</p>
        <h3>Undercut</h3>
        <p>{undercut.problem}</p>
        <ul className="app-undercut__facts">
          <li>
            <strong>20,000</strong> simulations per race
          </li>
          <li>
            <strong>8,000</strong> simulations of the season
          </li>
          <li>
            <strong>3</strong> public data sources
          </li>
        </ul>
        <p className="muted small">Figures from the project’s documentation.</p>
        <ProjectLinks project={undercut} small />
      </div>
    </div>
  );
}

function AboutApp() {
  return (
    <div className="app-prose">
      <h3>{profile.name}</h3>
      <p className="muted">
        {profile.year} · {education.degree} · {education.school}
      </p>
      <p>{profile.intro}</p>
      <p>{personal.story[1]}</p>
      <dl className="app-facts">
        <div>
          <dt>Graduation</dt>
          <dd>{education.graduation}</dd>
        </div>
        <div>
          <dt>GPA</dt>
          <dd>{education.gpa}</dd>
        </div>
        <div>
          <dt>Honours</dt>
          <dd>{education.honors.join(' · ')}</dd>
        </div>
        <div>
          <dt>Certificate</dt>
          <dd>
            {certifications[0].name} — {certifications[0].status}
          </dd>
        </div>
      </dl>
      <button type="button" className="btn btn--small" onClick={() => goTo('about')}>
        Read more <Icon name="arrow" />
      </button>
    </div>
  );
}

function SkillsApp() {
  return (
    <div className="app-skills">
      {skillGroups.map((g) => (
        <section key={g.id}>
          <h4>{g.label}</h4>
          <div className="chip-row">
            {g.skills.map((s) => (
              <span className="chip" key={s.name} title={s.usedIn ? `Used in ${s.usedIn}` : undefined}>
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResumeApp() {
  return (
    <div className="app-resume">
      <object data={`${profile.links.resume}#view=FitH`} type="application/pdf" aria-label="Resume PDF preview">
        <p>
          Your browser can’t show PDFs inline. <a href={profile.links.resume}>Open the resume</a>.
        </p>
      </object>
      <div className="app-resume__bar">
        <a className="btn btn--small btn--primary" href={profile.links.resume} download="AdityaGupta_Resume.pdf">
          <Icon name="download" /> Download
        </a>
        <a className="btn btn--small" href={profile.links.resume} target="_blank" rel="noopener noreferrer">
          <Icon name="external" /> Open in new tab
        </a>
      </div>
    </div>
  );
}

export function ContactList({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.links.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.location.href = `mailto:${profile.links.email}`;
    }
  };
  return (
    <ul className={`contact-list${compact ? ' contact-list--compact' : ''}`}>
      <li>
        <a href={`mailto:${profile.links.email}`}>
          <Icon name="mail" />
          <span>
            <strong>Email</strong>
            {profile.links.email}
          </span>
        </a>
        <button type="button" className="contact-list__copy" onClick={copy} aria-label="Copy email address">
          <Icon name={copied ? 'check' : 'copy'} />
          <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </li>
      <li>
        <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer">
          <Icon name="linkedin" />
          <span>
            <strong>LinkedIn</strong>
            in/adityagupta2307
          </span>
        </a>
      </li>
      <li>
        <a href={profile.links.github} target="_blank" rel="noopener noreferrer">
          <Icon name="github" />
          <span>
            <strong>GitHub</strong>
            aditya-gupta2307
          </span>
        </a>
      </li>
      <li>
        <a href={profile.links.resume} target="_blank" rel="noopener noreferrer">
          <Icon name="file" />
          <span>
            <strong>Resume</strong>
            PDF · updated Fall 2026
          </span>
        </a>
      </li>
    </ul>
  );
}

function ContactApp() {
  return (
    <div className="app-prose">
      <p>The fastest way to reach me is email. I’m happy to talk about internships, projects or F1.</p>
      <ContactList compact />
    </div>
  );
}

export function AppContent({ id }: { id: AppId }) {
  switch (id) {
    case 'projects':
      return <ProjectsApp />;
    case 'undercut':
      return <UndercutApp />;
    case 'about':
      return <AboutApp />;
    case 'skills':
      return <SkillsApp />;
    case 'resume':
      return <ResumeApp />;
    case 'contact':
      return <ContactApp />;
  }
}

export const openTerminal = () => setState({ mode: 'terminal' });
