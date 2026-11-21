import { useState } from 'react';
import { undercut, seatsNow, portfolioProject, undercutShots, type Project } from '../../data/projects';
import { ProjectLinks } from '../ui/ProjectLinks';
import { setState } from '../../state/store';
import { Icon } from '../ui/Icon';

function Gallery() {
  const shots = [{ src: undercut.image!.src, caption: 'Pit Wall — next-race pick, title odds and last-race recap', file: 'pit-wall.jpg' }, ...undercutShots];
  const [i, setI] = useState(0);
  const s = shots[i];
  return (
    <figure className="gallery">
      <div className="gallery__frame">
        <div className="gallery__chrome" aria-hidden="true">
          <span />
          <span />
          <span />
          <em>aditya-gupta2307.github.io/undercut</em>
        </div>
        <img key={s.src} src={s.src} alt={s.caption} loading="lazy" decoding="async" width={1600} height={1000} />
      </div>
      <figcaption>
        <div className="gallery__tabs" role="group" aria-label="Undercut screenshots">
          {shots.map((x, k) => (
            <button key={x.file} type="button" aria-pressed={k === i} onClick={() => setI(k)}>
              {x.caption.split(' — ')[0]}
            </button>
          ))}
        </div>
        <p className="gallery__caption">{s.caption}</p>
      </figcaption>
    </figure>
  );
}

function Detail({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="detail">
      <h4>{title}</h4>
      <ul>
        {items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function ProjectCard({ p, index }: { p: Project; index: string }) {
  return (
    <article className="pcard">
      <div className="pcard__top">
        <span className="pcard__index">{index}</span>
        <span className="pcard__kind">{p.kind}</span>
      </div>
      <h3>{p.name}</h3>
      <p className="pcard__tag">{p.tagline}</p>
      <p>{p.problem}</p>
      <Detail title="What I built" items={p.built} />
      <div className="chip-row">
        {p.stack.map((s) => (
          <span key={s} className="chip">
            {s}
          </span>
        ))}
      </div>
      {p.note && <p className="pcard__note">{p.note}</p>}
      <ProjectLinks project={p} small />
    </article>
  );
}

/** Scene 4: Undercut as the flagship, then the rest of the work. */
export function Projects() {
  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        <div className="projects__intro panel-left">
          <p className="eyebrow">Projects</p>
          <h2 id="projects-title" className="section__title">
            Things I’ve built, and what I learned building them.
          </h2>
        </div>

        <article className="flagship" aria-labelledby="undercut-title">
          <div className="flagship__head panel-left">
            <p className="flagship__kicker">
              <span className="flagship__light" aria-hidden="true" /> 01 · Flagship
            </p>
            <h3 id="undercut-title" className="flagship__title">
              Undercut
            </h3>
            <p className="flagship__tag">{undercut.tagline}</p>
            <p className="flagship__problem">{undercut.problem}</p>
            <ProjectLinks project={undercut} accent />
            <button type="button" className="flagship__car" onClick={() => setState({ focus: 'car' })}>
              <Icon name="flag" size={16} /> See the model car on the desk
            </button>
          </div>

          <Gallery />

          <div className="flagship__details">
            <Detail title="What I built" items={undercut.built} />
            <Detail title="What makes it interesting" items={undercut.interesting} />
            <div className="detail">
              <h4>Stack</h4>
              <div className="chip-row">
                {undercut.stack.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="projects__more">
          <ProjectCard p={seatsNow} index="02" />
          <ProjectCard p={portfolioProject} index="03" />
        </div>
      </div>
    </section>
  );
}
