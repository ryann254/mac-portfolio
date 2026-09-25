import type { Size } from './window-bounds'

/**
 * The registry. The dock reads it today; Launchpad, Spotlight, and the routes
 * read it from phase 5 on. Adding an app means adding one entry here and
 * nothing anywhere else.
 *
 * An app with a `window` size opens on the desktop. Phase 4 gives every one of
 * them the same placeholder to open; phases 6 to 8 replace those with the real
 * thing one at a time. Launchpad has no window because it is a full-screen
 * overlay, which phase 8 builds.
 *
 * `href` is no longer where the dock sends you. It is the address the window
 * will answer to once phase 5 puts the router behind it, and until then it is
 * still a page a reader can reach from the desktop folders.
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
  /** How big this app's window opens. Apps without one do not open a window. */
  readonly window?: Size
  /** The page holding this app's content, and from phase 5 the window's route. */
  readonly href?: string
  /** Set when `href` leaves the site, which the dock marks and opens in a tab. */
  readonly offsite?: true
}

/** An app the window manager can open, narrowed so `window` is no longer optional. */
export type WindowedApp = App & { readonly window: Size }

export const apps: readonly App[] = [
  {
    id: 'finder',
    name: 'Finder',
    icon: '/icons/finder.webp',
    href: '/about',
    window: { width: 860, height: 560 },
  },
  { id: 'launchpad', name: 'Launchpad', icon: '/icons/launchpad.webp' },
  {
    id: 'safari',
    name: 'Safari',
    icon: '/icons/safari.webp',
    href: '/projects',
    window: { width: 940, height: 620 },
  },
  {
    id: 'terminal',
    name: 'Terminal',
    icon: '/icons/terminal.webp',
    href: '/skills',
    window: { width: 720, height: 450 },
  },
  {
    id: 'photos',
    name: 'Photos',
    icon: '/icons/photos.webp',
    href: '/projects',
    window: { width: 900, height: 600 },
  },
  {
    id: 'resume',
    name: 'Resume',
    icon: '/icons/preview.webp',
    window: { width: 760, height: 640 },
  },
  {
    id: 'contact',
    name: 'Contact',
    icon: '/icons/mail.webp',
    href: '/contact',
    window: { width: 600, height: 480 },
  },
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

export const opensAWindow = (app: App): app is WindowedApp => app.window !== undefined

/** Apps the dock, and later Spotlight and the router, can open on the desktop. */
export const windowedApps: readonly WindowedApp[] = apps.filter(opensAWindow)

export const appById = (id: AppId): App => {
  const app = apps.find((entry) => entry.id === id)
  if (!app) throw new Error(`No app called ${id} is in the registry`)
  return app
}
