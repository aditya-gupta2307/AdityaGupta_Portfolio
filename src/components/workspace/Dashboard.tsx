import { useState } from 'react';
import { projects, undercut, undercutPages } from '../../data/projects';
import { ProjectLinks } from '../ui/ProjectLinks';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'flagship', label: 'Flagship' },
  { id: 'team', label: 'Team' },
  { id: 'personal', label: 'Personal' },
] as const;

const PIPELINE = [
  { step: 'Collect', detail: 'Jolpica · OpenF1 · Open-Meteo' },
  { step: 'Queue', detail: 'dedupe, rate-limit, cache' },
  { step: 'Rate', detail: 'Plackett–Luce, car + driver' },
  { step: 'Simulate', detail: '20k races · 8k seasons' },
  { step: 'Grade', detail: 'walk-forward backtest' },
];

/** Project dashboard: verified facts only — no live metrics or invented stats. */
export function Dashboard({ interactive }: { interactive: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');
  const others = projects.filter((p) => p.id !== 'undercut');
  const showUndercut = filter === 'all' || filter === 'flagship';
  const visible = others.filter((p) => filter === 'all' || (filter === 'team' && p.id === 'seatsnow') || (filter === 'personal' && p.id === 'portfolio'));
  const t = interactive ? 0 : -1;

  return (
    <div className="dash">
      <div className="dash__head">
        <div>
          <h2>Projects</h2>
          <p className="muted">What each one is, what I built, and where to see it.</p>
        </div>
        <div className="seg" role="group" aria-label="Filter projects">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)} tabIndex={t}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="dash__grid">
        {showUndercut && (
          <article className="dash__card dash__card--undercut">
            <div className="dash__card-top">
              <span className="dash__badge">Flagship · Live</span>
              <span className="muted small">{undercut.stack.slice(0, 3).join(' · ')}</span>
            </div>
            <h3>Undercut</h3>
            <p>{undercut.problem}</p>
            <ol className="pipeline" aria-label="How Undercut works">
              {PIPELINE.map((s, i) => (
                <li key={s.step}>
                  <span className="pipeline__n">{String(i + 1).padStart(2, '0')}</span>
                  <strong>{s.step}</strong>
                  <span>{s.detail}</span>
                </li>
              ))}
            </ol>
            <div className="dash__pages">
              <span className="muted small">{undercutPages.length} pages:</span> {undercutPages.map((p) => p.name).join(' · ')}
            </div>
            {interactive && <ProjectLinks project={undercut} small accent />}
          </article>
        )}
        {visible.map((p) => (
          <article key={p.id} className="dash__card">
            <div className="dash__card-top">
              <span className="dash__badge dash__badge--plain">{p.kind}</span>
            </div>
            <h3>{p.name}</h3>
            <p>{p.problem}</p>
            <ul className="dash__list">
              {p.interesting.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <div className="chip-row">
              {p.stack.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
            {p.note && <p className="muted small">{p.note}</p>}
            {interactive && <ProjectLinks project={p} small />}
          </article>
        ))}
      </div>
    </div>
  );
}
