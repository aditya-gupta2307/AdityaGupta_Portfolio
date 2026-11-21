/**
 * Skills, grouped as on the resume. `usedIn` is only filled where the resume
 * or a repository shows the skill in use; everything else stays empty rather
 * than guessed.
 */

export interface Skill {
  name: string;
  usedIn?: string;
}

export interface SkillGroup {
  id: string;
  label: string;
  command: string;
  summary: string;
  skills: Skill[];
}

export const skillGroups: SkillGroup[] = [
  {
    id: 'programming',
    label: 'Programming',
    command: 'skills --group programming',
    summary: 'Languages and frameworks I build with.',
    skills: [
      { name: 'TypeScript / JavaScript', usedIn: 'Undercut, this site' },
      { name: 'React', usedIn: 'Undercut, this site' },
      { name: 'Java', usedIn: 'SeatsNow · CS 180' },
      { name: 'C', usedIn: 'CS 240' },
      { name: 'HTML / CSS', usedIn: 'Undercut, this site' },
      { name: 'REST APIs', usedIn: 'Undercut (Jolpica, OpenF1, Open-Meteo)' },
    ],
  },
  {
    id: 'data',
    label: 'Data & Analytics',
    command: 'skills --group data',
    summary: 'Turning raw data into something you can reason about.',
    skills: [
      { name: 'Python' },
      { name: 'SQL' },
      { name: 'Power BI' },
      { name: 'Data cleaning', usedIn: 'Undercut' },
      { name: 'Data visualization', usedIn: 'Undercut' },
      { name: 'Statistical modeling', usedIn: 'Undercut' },
      { name: 'Research & analysis' },
    ],
  },
  {
    id: 'ai',
    label: 'AI Tools',
    command: 'skills --group ai',
    summary: 'Using AI to research, analyze data, and build and test practical solutions.',
    skills: [{ name: 'Purdue GenAI Studio' }, { name: 'Research & data analysis with AI' }, { name: 'Building & testing with AI tools', usedIn: 'Undercut' }],
  },
  {
    id: 'tools',
    label: 'Tools',
    command: 'skills --group tools',
    summary: 'The everyday toolchain.',
    skills: [
      { name: 'Git & GitHub', usedIn: 'every project' },
      { name: 'GitHub Actions', usedIn: 'Undercut deploys' },
      { name: 'VS Code' },
      { name: 'Linux / Unix command line' },
      { name: 'Microsoft Office — Word, Excel, PowerPoint, Outlook' },
    ],
  },
  {
    id: 'professional',
    label: 'Professional',
    command: 'skills --group professional',
    summary: 'How I work with people.',
    skills: [
      { name: 'Written & verbal communication' },
      { name: 'Presenting', usedIn: 'E2N presentation' },
      { name: 'Process documentation', usedIn: 'Undercut project guide' },
      { name: 'Teamwork', usedIn: 'SeatsNow' },
      { name: 'Organization' },
      { name: 'Leadership' },
    ],
  },
];
