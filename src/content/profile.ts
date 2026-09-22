import type { Profile } from './types'

export const profile: Profile = {
  name: 'Ryan Waweru',
  headline: 'Senior Frontend Engineer',
  summary: [
    "I'm a frontend engineer with six years of experience, most of it in React and TypeScript. The work I enjoy most is the kind where data keeps arriving while you are looking at it and the page still has to feel quick.",
    'At Streamlyne I built a real-time messaging product with voice that helps university researchers draft documents and ask questions about policy. Research submissions went up 29%. I also rebuilt parts of a long-running Java application in React and Node, which cut load times by 44%.',
    'Before that I worked on mobile and on the backend: a survey app in Flutter where lazy loading cut load times 25%, an author dashboard publishing to more than 5,000 students, and a property platform where analytics work improved ad spending by 20%.',
    "I'm in Nairobi and I work remotely with teams in the US, Europe, and the Middle East.",
  ],
  location: 'Nairobi, Kenya',
  email: 'ryannjoroge45@gmail.com',
  links: [
    { label: 'GitHub', href: 'https://github.com/ryann254' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/ryan-w-3a81a9198' },
  ],
  skillGroups: [
    {
      name: 'Frontend',
      skills: [
        'React',
        'TypeScript',
        'Next.js',
        'JavaScript',
        'Redux',
        'HTML',
        'CSS',
        'Responsive UI',
      ],
    },
    { name: 'Mobile', skills: ['Flutter'] },
    { name: 'Backend and APIs', skills: ['Node.js', 'REST APIs', 'GraphQL', 'MongoDB', 'SQL'] },
    {
      name: 'Testing and tooling',
      skills: ['Jest', 'Cypress', 'Git', 'Docker', 'CI/CD', 'AWS', 'Figma'],
    },
    {
      name: 'Also',
      skills: [
        'Real-time systems',
        'LLM applications',
        'Performance optimization',
        'Architecture design',
        'Code reviews',
        'Team leadership',
      ],
    },
  ],
  achievements: [
    {
      title: 'Research submissions up 29%',
      detail:
        'Built a real-time messaging product with voice that helps researchers prepare documents, ask questions about university policy, and plan budgets.',
    },
    {
      title: 'Load times down 44%',
      detail:
        'Rebuilt selected workflows of a long-running Java application in React and Node, and put the project in Docker so other developers could run it locally.',
    },
    {
      title: '45% of an application moved to React',
      detail: 'Migrated it incrementally, which made the interface faster and steadier as it went.',
    },
    {
      title: 'Subscriptions up 25%',
      detail:
        'Led a subscription dashboard for premium content and newsletters on an NFL-focused sports product.',
    },
    {
      title: 'Ad spending improved 20%',
      detail:
        'Added analytics to a property platform so managers could see where their traffic came from.',
    },
  ],
  education: [{ award: 'Diploma in Software Application Packages', school: 'Graffins College' }],
  certifications: ['Microsoft Azure Fundamentals', 'Huawei Certified ICT Associate, OWS Developer'],
}
