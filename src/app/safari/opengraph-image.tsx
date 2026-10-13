import { CARD, contentType } from '@/lib/og/card'
import { cardForRoute } from '@/lib/og/route-card'

export const size = CARD
export { contentType }

/** Safari with no project named, which is where `/safari` lands. */
export default function Image() {
  return cardForRoute('/safari')
}
