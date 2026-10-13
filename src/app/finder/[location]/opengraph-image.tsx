import { showingsOf } from '@/desktop/routes'
import { CARD, contentType } from '@/lib/og/card'
import { cardForRoute } from '@/lib/og/route-card'

export const size = CARD
export { contentType }

export function generateStaticParams() {
  return showingsOf('finder').map((folder) => ({ location: folder.slug }))
}

/** One card per folder in Finder's sidebar. */
export default async function Image({ params }: { params: Promise<{ location: string }> }) {
  return cardForRoute(`/finder/${(await params).location}`, 'In Finder')
}
