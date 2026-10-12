import { profile } from '@/content'
import { CARD, cardFor, contentType } from '@/lib/og/card'

export const alt = `${profile.name}, ${profile.headline}`
export const size = CARD
export { contentType }

/** The desktop itself, which is what a link to the site with no window on it shows. */
export default function Image() {
  return cardFor(profile.name, profile.tagline)
}
