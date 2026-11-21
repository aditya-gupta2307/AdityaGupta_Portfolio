import type { Project } from '../../data/projects';
import { Icon } from './Icon';

/** The live / code / case-study links for a project, in a consistent order. */
export function ProjectLinks({ project, small = false, accent = false }: { project: Project; small?: boolean; accent?: boolean }) {
  if (!project.links.length) return null;
  return (
    <div className="project-links">
      {project.links.map((l, i) => {
        const external = l.href.startsWith('http');
        const primary = i === 0;
        const cls = ['btn', small && 'btn--small', primary && (accent ? 'btn--undercut' : 'btn--primary')].filter(Boolean).join(' ');
        return (
          <a key={l.href} className={cls} href={l.href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
            {l.kind === 'code' ? <Icon name="github" /> : null}
            {l.label}
            {external ? <Icon name="external" /> : <Icon name="arrow" />}
          </a>
        );
      })}
    </div>
  );
}
