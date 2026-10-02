import { profile } from '@/content'
import type { Link } from '@/content/types'
import { appById, offsiteApps } from './apps'

/**
 * The three ways to reach Ryan, as rows. No form: a form needs a backend, a
 * spam story, and somewhere to read the mail, and none of that helps a recruiter
 * who already has a mail client open.
 *
 * The email and the links are content. The icon is the dock's, looked up by
 * where the link goes, so the row and the dock icon that goes to the same place
 * cannot end up wearing different art.
 */
export type Row = {
  readonly label: string
  /** The link as a person reads it, which is the address without its scheme. */
  readonly value: string
  readonly href: string
  readonly icon: string
  readonly kind: 'mail' | 'offsite'
}

/** `https://github.com/ryann254` reads as `github.com/ryann254`. */
const plain = (href: string): string => href.replace(/^https?:\/\//, '').replace(/\/$/, '')

const iconFor = (link: Link): string => {
  const app = offsiteApps.find((app) => app.href === link.href)
  if (!app) {
    throw new Error(
      `Nothing in the dock goes to ${link.href}, so the ${link.label} row has no icon. ` +
        'Add it to apps.ts as an offsite app, or take the link out of profile.ts.',
    )
  }
  return app.icon
}

export const rows: readonly Row[] = [
  {
    label: 'Email',
    value: profile.email,
    href: `mailto:${profile.email}`,
    icon: appById('contact').icon,
    kind: 'mail',
  },
  ...profile.links.map(
    (link): Row => ({
      label: link.label,
      value: plain(link.href),
      href: link.href,
      icon: iconFor(link),
      kind: 'offsite',
    }),
  ),
]
