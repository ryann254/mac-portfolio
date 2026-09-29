/**
 * The four places Finder can be, which are its sidebar and four of its URLs.
 * Phase 6 hangs the file tree off each one. Phase 5 needs their names because a
 * Finder window is titled by the folder it is in, the way macOS titles it.
 */
export const locations = [
  { slug: 'about', name: 'About' },
  { slug: 'projects', name: 'Projects' },
  { slug: 'experience', name: 'Experience' },
  { slug: 'skills', name: 'Skills' },
] as const
