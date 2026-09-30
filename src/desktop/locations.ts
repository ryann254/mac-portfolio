/**
 * The four places Finder starts from, which are its sidebar and four of its
 * URLs. The names are the ones on the folders sitting on the desktop and in the
 * mockup Ryan approved in phase 2, so a folder and the window it opens agree.
 * `file-tree.ts` hangs the files off each one.
 */
export const locations = [
  { slug: 'about', name: 'Intro' },
  { slug: 'projects', name: 'Projects' },
  { slug: 'experience', name: 'Work Experience' },
  { slug: 'skills', name: 'Skills' },
] as const
