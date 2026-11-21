/**
 * Projects, in display order. Facts here are taken from the resume and, for
 * Undercut, from the project's own repository and README.
 */

const BASE = import.meta.env.BASE_URL;

export interface ProjectLink {
  label: string;
  href: string;
  kind: 'live' | 'code' | 'case-study';
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  kind: string;
  problem: string;
  built: string[];
  interesting: string[];
  stack: string[];
  links: ProjectLink[];
  note?: string;
  image?: { src: string; alt: string };
}

export const undercut: Project = {
  id: 'undercut',
  name: 'Undercut',
  tagline: 'F1 forecasts that grade themselves.',
  kind: 'Flagship · F1 race forecasting & analytics platform',
  problem:
    'F1 predictions are everywhere, but almost nobody checks them afterwards. Undercut predicts every race and the championship from live public data, then scores those predictions against what actually happened.',
  built: [
    'Built and launched the whole site: forecasts, title odds, a lap-by-lap race replay, a pit-strategy lab and a model report card.',
    'Collected and cleaned race data from three public sources (Jolpica, OpenF1, Open-Meteo), matching records into one consistent dataset.',
    'Created a prediction model that rates drivers and cars from past results, then simulates each race thousands of times to estimate every driver’s chances.',
    'Designed interactive charts and dashboards — win-probability heatmaps and title trends — that turn raw timing data into readable insights.',
    'Measured the model’s accuracy against real race results with a walk-forward backtest.',
    'Cut duplicate data requests with a shared request queue and caching, keeping the site within the free APIs’ rate limits.',
  ],
  interesting: [
    'Plackett–Luce ranking model with a car + driver decomposition: teammates share the car term, so the driver term measures how someone compares in identical machinery.',
    'Fitted with Gaussian priors and Newton’s method; the Hessian gives Laplace-approximation uncertainty bars on every rating.',
    '20,000 simulations per race and 8,000 of the rest of the season, with FIA tie-break rules for the title.',
    'No server: the browser downloads the data and does all of the maths itself.',
  ],
  stack: ['TypeScript', 'React', 'd3', 'esbuild', 'Playwright', 'GitHub Actions'],
  links: [
    { label: 'Case study', href: `${BASE}undercut/`, kind: 'case-study' },
    { label: 'Live site', href: 'https://aditya-gupta2307.github.io/undercut/', kind: 'live' },
    { label: 'Source code', href: 'https://github.com/aditya-gupta2307/undercut', kind: 'code' },
  ],
  image: { src: `${BASE}media/undercut/pit-wall.jpg`, alt: 'The Undercut Pit Wall page: next-race pick, title odds and last-race recap.' },
};

export const seatsNow: Project = {
  id: 'seatsnow',
  name: 'SeatsNow',
  tagline: 'Concurrent event reservation system.',
  kind: 'CS 180 team project',
  problem:
    'When many people try to book the same event at once, a naive server can sell the same seat twice. SeatsNow lets multiple users browse events and reserve seats at the same time without that happening.',
  built: [
    'Built a client–server event reservation system in Java where multiple users browse events and reserve seats simultaneously.',
    'Implemented thread-safe server logic to handle simultaneous client requests and prevent double-booking.',
    'Divided responsibilities with teammates and managed shared code through GitHub to meet deadlines.',
  ],
  interesting: ['Concurrency control on shared seat state', 'Client–server networking in Java'],
  stack: ['Java', 'Sockets', 'Multithreading', 'Git'],
  links: [],
  note: 'Team project — the repository is private to the course team.',
};

export const portfolioProject: Project = {
  id: 'portfolio',
  name: 'This portfolio',
  tagline: 'A desk you can scroll into.',
  kind: 'Personal site',
  problem: 'A portfolio that shows how I build things, instead of only listing them.',
  built: [
    'Modelled the entire desk in code with Three.js — no downloaded 3D assets — and choreographed the camera to the page scroll.',
    'Built the in-monitor workspace: a desktop with windows, a portfolio terminal and a project dashboard, all as accessible HTML.',
  ],
  interesting: ['Procedural geometry and materials', 'Scroll-linked camera timeline', 'WebGL-to-HTML handoff'],
  stack: ['TypeScript', 'React', 'Three.js', 'React Three Fiber', 'GSAP', 'Vite'],
  links: [{ label: 'Source code', href: 'https://github.com/aditya-gupta2307/AdityaGupta_Portfolio', kind: 'code' }],
};

export const projects: Project[] = [undercut, seatsNow, portfolioProject];

/** The Undercut site's pages, from the project README. */
export const undercutPages = [
  { name: 'Pit Wall', desc: 'Countdown to the next session, the model’s pick for the next race, title odds and a last-race recap.' },
  { name: 'Race preview', desc: 'Win, podium and points chances, a finishing-position heatmap, qualifying, rain forecast and circuit history.' },
  { name: 'Race report', desc: 'Every driver’s chance of winning after each lap, plus gaps, tyre strategies and pit stops.' },
  { name: 'Replay', desc: 'The whole race on the real circuit at up to 50× speed with a timing tower and team radio.' },
  { name: 'Strategy Lab', desc: 'Move a driver’s pit stops and see where they would have finished; searches every one- and two-stop plan.' },
  { name: 'Title', desc: 'Championship odds, who can still win, a what-if tool and how the odds moved each round.' },
  { name: 'Model Lab', desc: 'How the model works and how accurate it has been this season.' },
  { name: 'Drivers', desc: 'Ratings that separate the driver from the car, and teammate head-to-heads.' },
  { name: 'Picks', desc: 'Call the podium before the race and try to beat the model.' },
  { name: 'Time Machine', desc: 'This season’s results scored with older eras’ points systems.' },
  { name: 'Learn', desc: 'A short guide to F1 for new fans, with a Rookie mode that explains terms anywhere on the site.' },
];

export const undercutShots = [
  { file: 'preview.jpg', caption: 'Race preview — finishing-position heatmap for Las Vegas' },
  { file: 'race-report.jpg', caption: 'Race report — lap-by-lap win chances in Mexico City' },
  { file: 'replay.jpg', caption: 'Replay — the race on the real circuit' },
  { file: 'strategy.jpg', caption: 'Strategy Lab — a driver’s best alternative strategy' },
  { file: 'title.jpg', caption: 'Title — how the championship odds moved after every round' },
  { file: 'model-lab.jpg', caption: 'Model Lab — accuracy against simple baselines' },
].map((s) => ({ ...s, src: `${BASE}media/undercut/${s.file}` }));
