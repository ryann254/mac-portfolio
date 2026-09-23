import type { Project } from './types'

/** The order they appear in Finder and Safari. */
export const projects: readonly Project[] = [
  {
    slug: 'streamlyne',
    name: 'Streamlyne',
    url: 'https://streamlyne.com/',
    tagline: 'Research administration software that U.S. universities run their grant work on.',
    contribution: [
      'I built the real-time messaging product with voice that helps researchers draft documents, ask questions about university policy, and plan budgets. Research submissions went up 29%.',
      'I also rebuilt selected workflows of the long-running Java application in React and Node, which cut load times 44%, and moved the project into Docker so other developers could run it locally.',
    ],
    under: 'streamlyne',
    period: '2025 to now',
    stack: ['React', 'TypeScript', 'Node.js', 'Java', 'Docker', 'LLM APIs'],
    thumbnail: '/projects/streamlyne.png',
    thumbnailNote: 'Screenshot of the live site.',
  },
  {
    slug: 'kazinbudget',
    name: 'Kazi&Budget',
    url: 'https://kazinbudget.netlify.app/',
    tagline: 'A salary and budget calculator for people working in Kenya.',
    contribution: [
      'My own project. You put in what you earn and what you spend, and it works out what actually reaches you after tax and the monthly bills.',
      'It also places your salary against the market, projects it ten years out, and shows the gap between the two.',
    ],
    under: 'personal',
    period: '2025',
    stack: ['React', 'TypeScript', 'Tailwind', 'Convex', 'Clerk', 'Recharts'],
    thumbnail: '/projects/kazinbudget.png',
    thumbnailNote: 'Screenshot of the live site.',
  },
  {
    slug: 'surveva',
    name: 'Surveva',
    url: 'https://surveva.com/',
    tagline:
      'A polling app where anyone writes a quick survey and gets answers back straight away.',
    contribution: [
      'I built and maintained features across the Flutter app and its Node backend.',
      'The lazy-loading algorithm I wrote cut survey load times 25%, which people felt most on the longer surveys. I also built the CI/CD pipeline the team shipped through.',
    ],
    under: 'surveva',
    period: '2024 to 2025',
    stack: ['Flutter', 'Node.js', 'REST APIs', 'CI/CD'],
    thumbnail: '/projects/surveva.png',
    thumbnailNote: 'Screenshot of the live site.',
  },
  {
    slug: 'newline',
    name: 'newline',
    url: 'https://www.newline.co/',
    tagline: 'Courses and books for working developers.',
    contribution: [
      'I led the author dashboard, where authors publish videos and books to more than 5,000 students, built in Next.js and Redux.',
      "I connected it to Discord's API so students could comment without leaving Discord, and built reporting views on MongoDB so authors could see how their content was doing.",
    ],
    under: 'newline',
    period: '2023',
    stack: ['Next.js', 'Redux', 'MongoDB', 'Discord API'],
    thumbnail: '/projects/newline.png',
    thumbnailNote: 'Screenshot of the live site.',
  },
  {
    slug: 'the-players-lounge',
    name: 'The Players Lounge',
    url: 'https://www.theplayerslounge.io/',
    tagline: 'A network connecting college athletes, athletic departments, and brands.',
    contribution: [
      'I led the subscription dashboard that manages access to premium content and newsletters, and subscriptions rose 25%.',
      'I worked with a cross-functional team on the frontend of the NFL-focused sports product and helped choose how it was put together.',
    ],
    under: 'tintash',
    period: '2023',
    stack: ['React', 'JavaScript', 'Cypress', 'Jest'],
    thumbnail: '/projects/the-players-lounge.png',
    thumbnailNote: 'Screenshot of the live site.',
  },
]
