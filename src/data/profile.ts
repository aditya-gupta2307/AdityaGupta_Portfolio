/**
 * Personal and academic details. Everything here comes from the current
 * resume (public/assets/Resume.pdf) or from content that was already on the
 * previous version of this site. Edit this file, not the components.
 */

const BASE = import.meta.env.BASE_URL;

export const profile = {
  name: 'Aditya Gupta',
  firstName: 'Aditya',
  role: 'Computer Science @ Purdue University',
  year: 'Sophomore',
  location: 'West Lafayette, IN',
  intro:
    'I’m a sophomore studying Computer Science at Purdue. I like building technically ambitious software — most recently Undercut, a Formula 1 forecasting site that simulates every race thousands of times and then checks how its predictions held up.',
  interests: ['Software engineering', 'Machine learning', 'Data science'],
  goal: 'Software Engineer',
  links: {
    email: 'adityaa.2307@gmail.com',
    github: 'https://github.com/aditya-gupta2307',
    linkedin: 'https://www.linkedin.com/in/adityagupta2307',
    instagram: 'https://www.instagram.com/_adityaagupta/',
    resume: `${BASE}assets/Resume.pdf`,
    portfolioRepo: 'https://github.com/aditya-gupta2307/AdityaGupta_Portfolio',
  },
};

export const education = {
  school: 'Purdue University',
  college: 'College of Science',
  degree: 'Bachelor of Science in Computer Science',
  location: 'West Lafayette, IN',
  graduation: 'Expected May 2029',
  gpa: '3.51 / 4.00',
  honors: ['Dean’s List — Fall 2025, Spring 2026', 'Semester Honors — Fall 2025'],
  completed: [
    { code: 'CS 180', name: 'Problem Solving & Object-Oriented Programming' },
    { code: 'CS 182', name: 'Foundations of Computer Science' },
    { code: 'CS 240', name: 'Programming in C' },
    { code: 'CS 193', name: 'Programming Tools' },
    { code: 'MA', name: 'Calculus I & II' },
    { code: 'ECON 251', name: 'Microeconomics' },
  ],
  inProgress: {
    term: 'Fall 2026',
    courses: [
      { code: 'CS 251', name: 'Data Structures & Algorithms' },
      { code: 'CS 250', name: 'Computer Architecture' },
      { code: 'MA 261', name: 'Multivariate Calculus' },
      { code: 'COM 217', name: 'Science Writing & Presentation' },
    ],
  },
};

export const certifications = [
  {
    name: 'IBM Data Science Professional Certificate',
    issuer: 'Coursera',
    status: 'In progress · expected 2027',
  },
];

export const activities = [
  {
    title: 'The Data Mine — Seminar I & II',
    when: 'Aug 2025 – May 2026',
    points: [
      'Explored data analysis, data ethics and interdisciplinary problem-solving in Purdue’s data science learning community.',
      'Collaborated in team-based discussions applying data-driven thinking to real-world problems.',
    ],
  },
  {
    title: 'E2N Presentation — COM 217 class project',
    when: 'Fall 2026',
    points: [
      'Developed a presentation teaching middle school students how the recommendation algorithms on TikTok and YouTube decide what users see, explaining technical ideas in simple terms.',
    ],
  },
];

/** Personal details carried over from the previous site. */
export const personal = {
  story: [
    'I’ve always been the person who’d rather understand how something works than just use it. That curiosity pulled me toward Computer Science, and it still keeps me up late now and then — chasing a bug, or learning a new tool because it looked interesting.',
    'Away from the keyboard I’m usually playing guitar or working through a puzzle someone swore was impossible. Both have the same rhythm as programming: small pieces, carefully arranged, adding up to something bigger.',
    'Formula 1 is the other constant — it’s the reason Undercut exists.',
  ],
  hobbies: ['Playing guitar', 'Solving puzzles', 'Formula 1'],
};
