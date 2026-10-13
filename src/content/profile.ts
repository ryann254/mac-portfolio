import type { Profile } from './types'

export const profile: Profile = {
  name: 'Ryan Waweru',
  headline: 'Senior Frontend Engineer',
  tagline:
    '6+ years of React, Next.js, and TypeScript, building large-scale products in education and real estate.',
  summary: [
    "I'm a frontend engineer with six years of experience, most of it in React and TypeScript. The work I enjoy most is the kind where data keeps arriving while you are looking at it and the page still has to feel quick.",
    'At Streamlyne I built a real-time messaging product with voice support that helps university researchers draft documents and ask questions about policy. Research submissions went up 29%. I also rebuilt nearly half of an old Java application in React and Node, which cut load times by 44%.',
    'Before that I worked on mobile apps and on the backend. Some projects include a survey app in Flutter where lazy loading cut load times by 25%, an author dashboard publishing to more than 5,000 students, and a property platform where analytics reduced ad spending by 20%.',
    "I'm in Nairobi and I work remotely with teams in the U.S., Europe, and the Middle East.",
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
      name: 'Practices',
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
        'Built a real-time messaging product with voice support that helps researchers prepare documents, ask questions about university policy, and plan budgets.',
    },
    {
      title: 'Load times down 44%',
      detail:
        'Rebuilt 45% of an old Java application in React and Node, one workflow at a time, and put the project in Docker so other developers could run it locally.',
    },
    {
      title: 'Subscriptions up 25%',
      detail:
        'Led a subscription dashboard for premium content and newsletters on an NFL-focused sports product.',
    },
    {
      title: 'Ad spending down 20%',
      detail:
        'Added analytics to a property platform so managers could see where their traffic came from.',
    },
  ],
  education: [{ award: 'Diploma in Software Application Packages', school: 'Graffins College' }],
  certifications: ['Microsoft Azure Fundamentals', 'Huawei Certified ICT Associate, OWS Developer'],
}
