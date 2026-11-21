import { profile, education, certifications, activities } from './profile';
import { projects, undercut } from './projects';
import { skillGroups } from './skills';

/**
 * The portfolio terminal. It only understands the commands below and never
 * evaluates input — it is a menu with a command-line interface.
 */

export type Line =
  | { kind: 'in'; text: string }
  | { kind: 'out'; text: string; tone?: 'muted' | 'accent' | 'ok' | 'head' }
  | { kind: 'err'; text: string }
  | { kind: 'link'; text: string; href: string; label?: string };

export interface CommandResult {
  lines: Line[];
  clear?: boolean;
  /** Navigation to perform after printing (runs inside the key handler). */
  open?: { href: string; newTab: boolean };
  /** Switch the workspace mode or open a desktop app. */
  action?: { mode?: 'desktop' | 'dashboard'; app?: 'projects' | 'undercut' | 'about' | 'skills' | 'resume' | 'contact' };
}

const out = (text: string, tone?: 'muted' | 'accent' | 'ok' | 'head'): Line => ({ kind: 'out', text, tone });
const link = (label: string, href: string, text = ''): Line => ({ kind: 'link', text, href, label });

const targets: Record<string, { href: string; newTab: boolean; desc: string }> = {
  undercut: { href: undercut.links[0].href, newTab: false, desc: 'Undercut case study' },
  'undercut-live': { href: 'https://aditya-gupta2307.github.io/undercut/', newTab: true, desc: 'Undercut live site' },
  'undercut-code': { href: 'https://github.com/aditya-gupta2307/undercut', newTab: true, desc: 'Undercut source code' },
  resume: { href: profile.links.resume, newTab: true, desc: 'Resume (PDF)' },
  github: { href: profile.links.github, newTab: true, desc: 'GitHub profile' },
  linkedin: { href: profile.links.linkedin, newTab: true, desc: 'LinkedIn profile' },
  email: { href: `mailto:${profile.links.email}`, newTab: false, desc: 'Write an email' },
  portfolio: { href: profile.links.portfolioRepo, newTab: true, desc: 'This site’s source code' },
};

export const COMMANDS: { name: string; usage?: string; desc: string }[] = [
  { name: 'help', desc: 'list commands' },
  { name: 'whoami', desc: 'who this is' },
  { name: 'about', desc: 'a short introduction' },
  { name: 'education', desc: 'Purdue, coursework and honours' },
  { name: 'projects', desc: 'what I’ve built' },
  { name: 'skills', usage: 'skills [group]', desc: 'skills, grouped' },
  { name: 'resume', desc: 'open the resume PDF' },
  { name: 'open', usage: 'open <target>', desc: 'open a project or link' },
  { name: 'contact', desc: 'how to reach me' },
  { name: 'dashboard', desc: 'switch to the project dashboard' },
  { name: 'ls', desc: 'list files' },
  { name: 'history', desc: 'commands you’ve run' },
  { name: 'clear', desc: 'clear the screen' },
];

const FILES: Record<string, string> = {
  'about.txt': 'about',
  'education.txt': 'education',
  'projects/': 'projects',
  'skills.txt': 'skills',
  'contact.txt': 'contact',
  'resume.pdf': 'resume',
};

export const WELCOME: Line[] = [
  out(`${profile.name} — portfolio terminal`, 'head'),
  out('Type a command and press Enter. Try `help`, `projects` or `open undercut`.', 'muted'),
];

export function complete(input: string): string {
  const parts = input.split(/\s+/);
  if (parts.length <= 1) {
    const m = COMMANDS.map((c) => c.name).filter((n) => n.startsWith(parts[0] ?? ''));
    return m.length === 1 ? `${m[0]} ` : input;
  }
  const [cmd, arg = ''] = parts;
  let pool: string[] = [];
  if (cmd === 'open') pool = Object.keys(targets);
  if (cmd === 'skills') pool = skillGroups.map((g) => g.id);
  if (cmd === 'cat') pool = Object.keys(FILES);
  const m = pool.filter((p) => p.startsWith(arg));
  return m.length === 1 ? `${cmd} ${m[0]}` : input;
}

export function run(raw: string, history: string[]): CommandResult {
  const input = raw.trim();
  if (!input) return { lines: [] };
  const [cmd, ...args] = input.split(/\s+/);
  const arg = args.join(' ').toLowerCase();

  switch (cmd.toLowerCase()) {
    case 'help':
      return {
        lines: [
          out('Available commands', 'head'),
          ...COMMANDS.map((c) => out(`  ${(c.usage ?? c.name).padEnd(16)} ${c.desc}`)),
          out(`  open targets: ${Object.keys(targets).join(', ')}`, 'muted'),
          out('  Tab completes, ↑/↓ walks history.', 'muted'),
        ],
      };

    case 'whoami':
      return { lines: [out(profile.name, 'head'), out(`${profile.year} · ${profile.role}`), out(profile.location, 'muted')] };

    case 'about':
      return {
        lines: [out(profile.intro), out(`Interests: ${profile.interests.join(' · ')}`, 'muted'), out(`Goal: ${profile.goal}`, 'muted')],
      };

    case 'education':
      return {
        lines: [
          out(`${education.school} — ${education.college}`, 'head'),
          out(`${education.degree} · ${education.graduation}`),
          out(`GPA ${education.gpa}`),
          ...education.honors.map((h) => out(`★ ${h}`, 'accent')),
          out('Completed:', 'muted'),
          ...education.completed.map((c) => out(`  ${c.code.padEnd(9)} ${c.name}`)),
          out(`In progress (${education.inProgress.term}):`, 'muted'),
          ...education.inProgress.courses.map((c) => out(`  ${c.code.padEnd(9)} ${c.name}`)),
          ...certifications.map((c) => out(`Certificate: ${c.name} (${c.issuer}) — ${c.status}`, 'muted')),
        ],
      };

    case 'projects':
      return {
        lines: [
          out('Projects', 'head'),
          ...projects.flatMap((p) => [out(`  ${p.name.padEnd(16)} ${p.tagline}`), out(`  ${''.padEnd(16)} ${p.stack.join(', ')}`, 'muted')]),
          out('Run `open undercut` for the case study, or `dashboard` for details.', 'muted'),
        ],
      };

    case 'skills': {
      const groups = arg ? skillGroups.filter((g) => g.id.startsWith(arg) || g.label.toLowerCase().startsWith(arg)) : skillGroups;
      if (!groups.length) return { lines: [{ kind: 'err', text: `no skill group "${arg}" — try: ${skillGroups.map((g) => g.id).join(', ')}` }] };
      return {
        lines: groups.flatMap((g) => [
          out(g.label, 'head'),
          ...g.skills.map((s) => out(`  ${s.name}${s.usedIn ? `  — ${s.usedIn}` : ''}`)),
        ]),
      };
    }

    case 'resume':
      return { lines: [out('Opening resume…', 'ok'), link('Resume.pdf', profile.links.resume)], open: { href: profile.links.resume, newTab: true } };

    case 'open': {
      const key = arg.replace(/^undercut\s+/, 'undercut-');
      const t = targets[key];
      if (!t) {
        return {
          lines: [
            { kind: 'err', text: arg ? `open: unknown target "${arg}"` : 'open: which one?' },
            ...Object.entries(targets).map(([k, v]) => out(`  ${k.padEnd(15)} ${v.desc}`, 'muted')),
          ],
        };
      }
      return { lines: [out(`Opening ${t.desc}…`, 'ok'), link(t.desc, t.href)], open: t };
    }

    case 'contact':
    case 'socials':
      return {
        lines: [
          out('Contact', 'head'),
          link(profile.links.email, `mailto:${profile.links.email}`, 'email     '),
          link('github.com/aditya-gupta2307', profile.links.github, 'github    '),
          link('linkedin.com/in/adityagupta2307', profile.links.linkedin, 'linkedin  '),
          link('instagram.com/_adityaagupta', profile.links.instagram, 'instagram '),
        ],
      };

    case 'activities':
      return { lines: activities.flatMap((a) => [out(`${a.title} · ${a.when}`, 'head'), ...a.points.map((p) => out(`  ${p}`))]) };

    case 'dashboard':
      return { lines: [out('Switching to the dashboard…', 'ok')], action: { mode: 'dashboard' } };

    case 'ls':
      return { lines: [out(Object.keys(FILES).join('   '))] };

    case 'cat': {
      const target = FILES[arg];
      if (!target) return { lines: [{ kind: 'err', text: `cat: ${arg || '(nothing)'}: no such file` }] };
      return run(target, history);
    }

    case 'history':
      return { lines: history.map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`)) };

    case 'clear':
      return { lines: [], clear: true };

    case 'date':
      return { lines: [out(new Date().toString())] };

    case 'echo':
      return { lines: [out(args.join(' '))] };

    case 'sudo':
    case 'rm':
    case 'cd':
      return { lines: [{ kind: 'err', text: `${cmd}: this is a portfolio terminal, not a real shell — try \`help\`` }] };

    default:
      return { lines: [{ kind: 'err', text: `command not found: ${cmd} — type \`help\`` }] };
  }
}
