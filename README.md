# Aditya Gupta — Portfolio

An interactive 3D portfolio: a desk rendered in real time with Three.js, where scrolling moves the camera from the whole desk, into the monitor's working desktop, and on through my projects, skills and background.

**Live:** https://aditya-gupta2307.github.io/AdityaGupta_Portfolio/

## What's here

- **A desk modelled entirely in code.** The monitor, keyboard (every keycap), mouse, headphones, lamp, books, puzzle cube and a Formula 1-style model car are procedural Three.js geometry with generated textures — no downloaded 3D assets or HDR files.
- **Scroll-driven camera.** One GSAP ScrollTrigger timeline, measured in scroll pixels, moves the camera between framings for each section and reverses cleanly when scrolling back.
- **A working monitor.** The screen is real HTML placed in 3D. Scrolling into it hands off to a full-screen copy of the same interface: a desktop with windows, a portfolio terminal (`help`, `projects`, `open undercut`, …) and a project dashboard.
- **Interactive objects.** Click the model car for Undercut, the keyboard for the terminal, the Purdue books for education, and so on. Every object has an HTML button twin for keyboard and screen-reader users.
- **Undercut case study** at [`/undercut/`](https://aditya-gupta2307.github.io/AdityaGupta_Portfolio/undercut/), with interactive explainers for the ranking model and the undercut itself.
- **Fallbacks.** Without WebGL (or with `?lite`), the page renders the same content without the scene. Reduced-motion preferences cut between camera framings instead of animating.

## Stack

React · TypeScript · Vite · Three.js · React Three Fiber · Drei · GSAP ScrollTrigger · GitHub Pages

## Develop

Requires Node.js 20 or newer.

```bash
npm install
npm run dev        # http://localhost:5173/AdityaGupta_Portfolio/
npm run build      # type-checks, then builds to dist/
npm run preview    # serves the production build locally
npm run format     # Prettier
```

## Project structure

```
index.html                  main page entry
undercut/index.html         case-study entry
public/                     resume PDF, Undercut screenshots, old-URL redirects, 404 page
src/
  data/                     all content: profile, projects, skills, terminal commands
  state/store.ts            small shared store read by both the UI and the scene
  hooks/                    scroll choreography, media queries, WebGL detection
  components/
    scene/                  the 3D desk: objects, materials, lighting, camera rig
    workspace/              the monitor interface: desktop, windows, terminal, dashboard
    portfolio/              page sections
    ui/                     navigation, icons, shared buttons
  undercut/                 the case-study page and its explainers
  styles/                   design tokens and styles
```

To update content, edit the files in `src/data/` — components read from there. The resume lives at `public/assets/Resume.pdf`; keep that file name so existing links keep working.

## Deploy

The site deploys to GitHub Pages through GitHub Actions (`.github/workflows/deploy.yml`):

1. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (one time).
2. Push to `main`. The workflow builds the site and publishes `dist/`.

Vite's `base` is set to `/AdityaGupta_Portfolio/` to match the Pages URL. The old `about.html`, `projects.html` and `resume.html` URLs redirect to the matching sections.
