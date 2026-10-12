/**
 * Where this site answers from, which the sitemap, `robots.txt` and every
 * absolute URL in the metadata need and which the code cannot know on its own.
 *
 * Vercel hands the production host to the build, so a preview deploy and
 * production each describe themselves correctly with nothing set. A domain,
 * when there is one, is one environment variable and no code change.
 */
const VERCEL = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const origin: string =
  process.env.NEXT_PUBLIC_SITE_URL ?? (VERCEL ? `https://${VERCEL}` : 'http://localhost:3010')

export const urlOf = (route: string): string => new URL(route, origin).toString()
