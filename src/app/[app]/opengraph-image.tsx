import { addressedApps } from '@/desktop/apps'
import { showingsOf } from '@/desktop/routes'
import { CARD, contentType } from '@/lib/og/card'
import { cardForRoute } from '@/lib/og/route-card'

export const size = CARD
export { contentType }

/**
 * Every app except the two that have a route folder of their own. Asked for
 * `/finder/opengraph-image`, Next commits to the `finder/` folder and never
 * falls back here, so Finder and Safari carry their own card file beside their
 * folder and this one would only be a second route writing the same file.
 */
export function generateStaticParams() {
  return addressedApps
    .filter((app) => showingsOf(app.id).length === 0)
    .map((app) => ({ app: app.id }))
}

export default async function Image({ params }: { params: Promise<{ app: string }> }) {
  return cardForRoute(`/${(await params).app}`)
}
