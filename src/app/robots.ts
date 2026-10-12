import type { MetadataRoute } from 'next'
import { urlOf } from '@/lib/site'

/** Everything here is meant to be found, so the only rule is where the map is. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: urlOf('/sitemap.xml'),
  }
}
