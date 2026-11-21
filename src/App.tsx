import { useEffect, useState } from 'react';
import { Nav } from './components/ui/Nav';
import { SceneLayer } from './components/SceneLayer';
import { Hero, Approach } from './components/portfolio/Hero';
import { WorkspaceSection } from './components/portfolio/WorkspaceSection';
import { Projects } from './components/portfolio/Projects';
import { Skills } from './components/portfolio/Skills';
import { About } from './components/portfolio/About';
import { Contact, Resume } from './components/portfolio/Contact';
import { UndercutIntro } from './components/portfolio/UndercutIntro';
import { useScrollChoreography } from './hooks/useScrollChoreography';
import { detectQuality, hasWebGL, useReducedMotion } from './hooks/useMedia';
import { setState } from './state/store';

export default function App() {
  const reducedMotion = useReducedMotion();
  const [has3D, setHas3D] = useState(() => hasWebGL());
  const [quality] = useState(detectQuality);

  useScrollChoreography(reducedMotion);

  useEffect(() => {
    if (!has3D) setState({ screenOn: true });
  }, [has3D]);

  // Honour a deep link (#projects, #about…) once the layout has settled.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 60);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <a className="skip-link" href="#projects">
        Skip the 3D intro
      </a>
      <Nav />
      <SceneLayer has3D={has3D} quality={quality} reducedMotion={reducedMotion} onFail={() => setHas3D(false)} />
      <main className="page" data-3d={has3D}>
        <Hero has3D={has3D} />
        <Approach />
        <WorkspaceSection has3D={has3D} />
        <Projects />
        <Skills />
        <About />
        <Resume />
        <Contact />
      </main>
      <UndercutIntro />
    </>
  );
}
