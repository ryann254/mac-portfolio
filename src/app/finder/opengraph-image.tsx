import { CARD, contentType } from '@/lib/og/card'
import { cardForRoute } from '@/lib/og/route-card'

export const size = CARD
export { contentType }

/** Finder with no folder named, which is where `/finder` lands. */
export default function Image() {
  return cardForRoute('/finder')
}
