import type { MetadataRoute } from 'next'
import { routes } from '@/desktop/routes'
import { urlOf } from '@/lib/site'

/**
 * Every address the registry promises, which is the same list `routes.ts`
 * builds the pages from, so a new app or a new project turns up here with no
 * edit. `tests/sharing.spec.ts` fails if the two ever drift.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: urlOf(route),
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }))
}
