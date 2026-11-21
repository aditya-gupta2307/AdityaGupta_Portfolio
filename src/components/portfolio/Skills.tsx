import { useEffect, useRef, useState } from 'react';
import { skillGroups } from '../../data/skills';
import { pulseKey } from '../../state/store';
import { useReducedMotion } from '../../hooks/useMedia';

/**
 * Scene 5: skills as keycaps. Pressing a cap "types" its command into the
 * readout (and dips the matching keys on the 3D keyboard).
 */
export function Skills() {
  const [active, setActive] = useState(skillGroups[0].id);
  const group = skillGroups.find((g) => g.id === active)!;
  const [typed, setTyped] = useState(group.command);
  const reduce = useReducedMotion();
  const timer = useRef(0);

  useEffect(() => {
    window.clearInterval(timer.current);
    if (reduce) {
      setTyped(group.command);
      return;
    }
    let n = 0;
    setTyped('');
    timer.current = window.setInterval(() => {
      n++;
      const ch = group.command[n - 1];
      if (ch) pulseKey(ch === ' ' ? ' ' : ch);
      setTyped(group.command.slice(0, n));
      if (n >= group.command.length) window.clearInterval(timer.current);
    }, 28);
    return () => window.clearInterval(timer.current);
  }, [group, reduce]);

  const done = typed === group.command;

  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="container">
        <div className="skills__inner panel-left">
          <p className="eyebrow">Skills</p>
          <h2 id="skills-title" className="section__title">
            The toolkit, grouped by what it’s for.
          </h2>
          <p className="section__lead">Where a skill shows up in a project or course, it says so. No logo wall.</p>

          <div className="keys" role="tablist" aria-label="Skill groups">
            {skillGroups.map((g) => (
              <button
                key={g.id}
                type="button"
                role="tab"
                id={`skill-tab-${g.id}`}
                aria-selected={g.id === active}
                aria-controls="skill-panel"
                className="key"
                onClick={() => setActive(g.id)}
              >
                <span className="key__top">{g.label}</span>
              </button>
            ))}
          </div>

          <div className="readout" role="tabpanel" id="skill-panel" aria-labelledby={`skill-tab-${active}`}>
            <div className="readout__cmd" aria-hidden="true">
              <span className="readout__prompt">~ %</span> {typed}
              {!done && <span className="term__caret" />}
            </div>
            <p className="readout__summary">{group.summary}</p>
            <ul className="readout__list" data-ready={done}>
              {group.skills.map((s, i) => (
                <li key={s.name} style={{ ['--i' as string]: i }}>
                  <span className="readout__name">{s.name}</span>
                  {s.usedIn ? <span className="readout__used">{s.usedIn}</span> : <span className="readout__used readout__used--none" />}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
