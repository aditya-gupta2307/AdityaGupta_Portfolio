import { lazy, Suspense, useState } from 'react';
import { undercut, undercutPages, undercutShots } from '../data/projects';
import { profile } from '../data/profile';
import { Icon } from '../components/ui/Icon';
import { hasWebGL, useReducedMotion } from '../hooks/useMedia';
import { RankingDemo, UndercutDemo } from './Demos';

const CarStage = lazy(() => import('./CarStage'));
const HOME = import.meta.env.BASE_URL;

const PIPELINE = [
  {
    n: '01',
    title: 'Collect',
    text: 'Results and standings from the Jolpica F1 API; lap times, pit stops, positions and team radio from OpenF1; rain forecasts from Open-Meteo.',
  },
  {
    n: '02',
    title: 'Queue',
    text: 'One shared request queue deduplicates identical in-flight requests, respects each API’s rate limits with sliding windows that survive a reload, prioritises what is on screen, and retries with backoff.',
  },
  {
    n: '03',
    title: 'Rate',
    text: 'A Plackett–Luce ranking model splits every result into a car term and a driver term, weighting recent races more. A separate model estimates each car’s chance of retiring.',
  },
  {
    n: '04',
    title: 'Simulate',
    text: 'The next race is simulated 20,000 times and the rest of the season 8,000 times. During a race, the same idea runs after every lap with the real gaps, tyres and stops.',
  },
  {
    n: '05',
    title: 'Grade',
    text: 'A walk-forward backtest re-predicts every past race using only what was known beforehand, then scores it against simple baselines such as grid order.',
  },
];

const ENGINEERING = [
  { title: 'No server', text: 'The browser downloads the public data and does all of the maths itself, so the site is a static deploy on GitHub Pages.' },
  {
    title: 'Uncertainty, not just a ranking',
    text: 'The ratings are fitted with Gaussian priors and Newton’s method; the Hessian gives Laplace-approximation uncertainty bars on every driver and car.',
  },
  {
    title: 'Less noisy probabilities',
    text: 'Win chances are Rao–Blackwellised: each simulation adds every surviving car’s exact first-choice probability instead of only counting the sampled winner.',
  },
  {
    title: 'Strategy Lab',
    text: 'A per-race tyre model — a robust regression of lap time on compound, tyre age and fuel — replays a car’s race under a different pit plan and searches every one- and two-stop strategy.',
  },
  {
    title: 'Tested end to end',
    text: 'Unit tests cover the models and data parsing; Playwright tests run the built site against a fake API. GitHub Actions type-checks, tests, builds and deploys.',
  },
];

export function UndercutPage() {
  const reduce = useReducedMotion();
  const [webgl] = useState(hasWebGL);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="uc-bar">
        <div className="uc-bar__inner">
          <a href={HOME} className="uc-bar__back">
            <Icon name="arrow" size={16} className="flip" /> {profile.name}
          </a>
          <span className="uc-bar__title">
            <span className="uc-bar__light" aria-hidden="true" /> Undercut · case study
          </span>
          <a className="btn btn--small btn--undercut" href={undercut.links[1].href} target="_blank" rel="noopener noreferrer">
            Live site <Icon name="external" />
          </a>
        </div>
      </header>

      <main id="main" className="uc">
        <section className="uc-hero">
          <div className="uc-wrap uc-hero__grid">
            <div className="uc-hero__copy">
              <p className="uc-kicker">Flagship project · 2026</p>
              <h1 className="uc-hero__title">Undercut</h1>
              <p className="uc-hero__tag">{undercut.tagline}</p>
              <p className="uc-hero__text">{undercut.problem}</p>
              <div className="project-links">
                <a className="btn btn--undercut" href={undercut.links[1].href} target="_blank" rel="noopener noreferrer">
                  Open the live site <Icon name="external" />
                </a>
                <a className="btn" href={undercut.links[2].href} target="_blank" rel="noopener noreferrer">
                  <Icon name="github" /> Source code
                </a>
              </div>
              <dl className="uc-stats">
                <div>
                  <dt>Race simulations</dt>
                  <dd>20,000</dd>
                </div>
                <div>
                  <dt>Season simulations</dt>
                  <dd>8,000</dd>
                </div>
                <div>
                  <dt>Public data sources</dt>
                  <dd>3</dd>
                </div>
                <div>
                  <dt>Pages</dt>
                  <dd>{undercutPages.length}</dd>
                </div>
              </dl>
            </div>
            <div className="uc-hero__stage">
              {webgl ? (
                <Suspense fallback={null}>
                  <CarStage reducedMotion={reduce} />
                </Suspense>
              ) : (
                <img src={undercut.image!.src} alt={undercut.image!.alt} />
              )}
              {webgl && <p className="uc-hero__drag">Drag to look around · modelled in code</p>}
            </div>
          </div>
        </section>

        <section className="uc-section" aria-labelledby="uc-what">
          <div className="uc-wrap">
            <p className="uc-kicker">What it does</p>
            <h2 id="uc-what" className="uc-h2">
              Predict every race. Then check.
            </h2>
            <div className="uc-pages">
              {undercutPages.map((p, i) => (
                <div key={p.name} className="uc-page">
                  <span className="uc-page__n">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                </div>
              ))}
            </div>
            <div className="uc-shots">
              {undercutShots.map((s) => (
                <figure key={s.file}>
                  <img src={s.src} alt={s.caption} loading="lazy" decoding="async" width={1600} height={1000} />
                  <figcaption>{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="uc-section" aria-labelledby="uc-how">
          <div className="uc-wrap">
            <p className="uc-kicker">How it works</p>
            <h2 id="uc-how" className="uc-h2">
              From public data to a probability.
            </h2>
            <ol className="uc-pipeline">
              {PIPELINE.map((s) => (
                <li key={s.n}>
                  <span className="uc-pipeline__n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="uc-section" aria-labelledby="uc-rank">
          <div className="uc-wrap uc-split">
            <div>
              <p className="uc-kicker">The ranking model</p>
              <h2 id="uc-rank" className="uc-h2">
                Strength in, chances out.
              </h2>
              <p className="uc-text">
                Undercut reads a finishing order as a sequence of choices: the winner is picked from everyone in proportion to their strength, second place from
                whoever is left, and so on. In Undercut each strength is a car term plus a driver term; teammates share the car term, so the driver term
                measures someone against the person in identical machinery.
              </p>
              <p className="uc-text">The explainer here uses five made-up cars so you can see how strengths turn into win and podium chances.</p>
            </div>
            <RankingDemo />
          </div>
        </section>

        <section className="uc-section" aria-labelledby="uc-strategy">
          <div className="uc-wrap uc-split">
            <div>
              <p className="uc-kicker">The name</p>
              <h2 id="uc-strategy" className="uc-h2">
                Why “undercut”?
              </h2>
              <p className="uc-text">
                Pit before the car ahead and your new tyres are faster than their worn ones for a lap or two. If that gains back more than the gap, you come out
                in front when they stop. Undercut’s Strategy Lab does this properly with a fitted tyre model; this toy version shows the idea.
              </p>
            </div>
            <UndercutDemo />
          </div>
        </section>

        <section className="uc-section" aria-labelledby="uc-eng">
          <div className="uc-wrap">
            <p className="uc-kicker">Engineering</p>
            <h2 id="uc-eng" className="uc-h2">
              The parts I’m proudest of.
            </h2>
            <div className="uc-eng">
              {ENGINEERING.map((e) => (
                <div key={e.title} className="uc-eng__item">
                  <h3>{e.title}</h3>
                  <p>{e.text}</p>
                </div>
              ))}
            </div>
            <div className="uc-limits">
              <h3>Known limitations</h3>
              <p>
                The model doesn’t know about weather, car upgrades or late penalties, so wet races are harder to call than the numbers suggest. The Strategy Lab
                doesn’t model traffic or other cars reacting to a stop.
              </p>
            </div>
            <div className="chip-row uc-stack">
              {undercut.stack.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="uc-section uc-cta">
          <div className="uc-wrap">
            <h2 className="uc-h2">See it on a real race weekend.</h2>
            <div className="project-links">
              <a className="btn btn--undercut" href={undercut.links[1].href} target="_blank" rel="noopener noreferrer">
                Open Undercut <Icon name="external" />
              </a>
              <a className="btn" href={undercut.links[2].href} target="_blank" rel="noopener noreferrer">
                <Icon name="github" /> Read the code
              </a>
              <a className="btn" href={HOME}>
                Back to the portfolio
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="uc-wrap footer__inner">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p className="muted uc-disclaimer">
            Undercut is an unofficial fan project and isn’t associated with the Formula 1 companies. F1 and related marks are trade marks of Formula One
            Licensing B.V.
          </p>
        </div>
      </footer>
    </>
  );
}
