/**
 * The registry. The dock reads it today; Launchpad, Spotlight, and the routes
 * read it from phase 5 on. Adding an app means adding one entry here and
 * nothing anywhere else.
 *
 * Phase 4 adds the window fields (`component`, `defaultSize`) and every app
 * opens in a window instead of following `href`. Until then `href` is the page
 * that already holds that app's content, so nothing in the dock is a dead
 * control. Launchpad and Resume have no content yet and are drawn but not
 * clickable; phases 7 and 8 build them.
 */
export type AppId =
  | 'finder'
  | 'launchpad'
  | 'safari'
  | 'terminal'
  | 'photos'
  | 'resume'
  | 'contact'
  | 'github'
  | 'linkedin'

export type App = {
  readonly id: AppId
  readonly name: string
  /** Path under `public/`. */
  readonly icon: string
  /** Where this app's content lives today. */
  readonly href?: string
  /** Set when `href` leaves the site, which the dock marks and opens in a tab. */
  readonly offsite?: true
}

export const apps: readonly App[] = [
  { id: 'finder', name: 'Finder', icon: '/icons/finder.webp', href: '/about' },
  { id: 'launchpad', name: 'Launchpad', icon: '/icons/launchpad.webp' },
  { id: 'safari', name: 'Safari', icon: '/icons/safari.webp', href: '/projects' },
  { id: 'terminal', name: 'Terminal', icon: '/icons/terminal.webp', href: '/skills' },
  { id: 'photos', name: 'Photos', icon: '/icons/photos.webp', href: '/projects' },
  { id: 'resume', name: 'Resume', icon: '/icons/preview.webp' },
  { id: 'contact', name: 'Contact', icon: '/icons/mail.webp', href: '/contact' },
  {
    id: 'github',
    name: 'GitHub',
    icon: '/icons/github.png',
    href: 'https://github.com/ryann254',
    offsite: true,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '/icons/linkedin.svg',
    href: 'https://linkedin.com/in/ryan-w-3a81a9198',
    offsite: true,
  },
]

/** Apps that live on this site. */
export const siteApps = apps.filter((app) => !app.offsite)

/** Apps that take the reader somewhere else. The dock keeps them behind a rule. */
export const offsiteApps = apps.filter((app) => app.offsite)
