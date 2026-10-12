import type { Size } from './window-bounds'

/**
 * The registry. The dock reads it today; Launchpad, Spotlight, and the routes
 * read it from phase 5 on. Adding an app means adding one entry here and
 * nothing anywhere else.
 *
 * An app with a `window` size opens on the desktop. Phase 6 builds Finder, the
 * text window, and the image window; phases 7 and 8 replace the rest of the
 * placeholders one at a time. Launchpad has no window because it is a
 * full-screen overlay, which phase 8 builds.
 *
 * An app's address is its id: Finder is at `/finder`. `routes.ts` reads that
 * out of here, so `href` is left to the two apps that leave the site.
 */
export type AppId =
  | 'finder'
  | 'launchpad'
  | 'safari'
  | 'terminal'
  | 'photos'
  | 'resume'
  | 'contact'
  | 'text'
  | 'image'
  | 'github'
  | 'linkedin'

/**
 * How the reader gets to an app, which is the one fact that decides whether it
 * has a dock icon and whether it has an address.
 */
export type Reach =
  /** An icon in the dock, and an address of its own if it opens a window. */
  | 'desktop'
  /** An icon in the dock that opens a tab somewhere else. */
  | 'offsite'
  /**
   * Neither. Finder opens it on a file, and a dock icon and a bare address both
   * name no file, so there would be nothing for either of them to open.
   */
  | 'file'

export type App = {
  readonly id: AppId
  readonly name: string
  readonly reach: Reach
  /** Path under `public/`. */
  readonly icon: string
  /** How big this app's window opens. Apps without one do not open a window. */
  readonly window?: Size
  /** Where this app goes when it leaves the site. The dock marks it and opens a tab. */
  readonly href?: string
  /**
   * Kept in the dock on a phone. The home screen already lists every app, so a
   * dock that listed them again would be the same eight icons twice; these four
   * are the ones worth a permanent row under it.
   */
  readonly pinned?: true
}

/** An app the window manager can open, narrowed so `window` is no longer optional. */
export type WindowedApp = App & { readonly window: Size }

export const apps: readonly App[] = [
  {
    id: 'finder',
    reach: 'desktop',
    pinned: true,
    name: 'Finder',
    icon: '/icons/finder.webp',
    window: { width: 980, height: 640 },
  },
  { id: 'launchpad', reach: 'desktop', name: 'Launchpad', icon: '/icons/launchpad.webp' },
  {
    id: 'safari',
    reach: 'desktop',
    pinned: true,
    name: 'Safari',
    icon: '/icons/safari.webp',
    window: { width: 940, height: 620 },
  },
  {
    id: 'terminal',
    reach: 'desktop',
    name: 'Terminal',
    icon: '/icons/terminal.webp',
    window: { width: 720, height: 450 },
  },
  {
    id: 'photos',
    reach: 'desktop',
    name: 'Photos',
    icon: '/icons/photos.webp',
    window: { width: 900, height: 600 },
  },
  {
    id: 'resume',
    reach: 'desktop',
    pinned: true,
    name: 'Resume',
    icon: '/icons/preview.webp',
    window: { width: 760, height: 640 },
  },
  {
    id: 'contact',
    reach: 'desktop',
    pinned: true,
    name: 'Contact',
    icon: '/icons/mail.webp',
    window: { width: 600, height: 480 },
  },
  {
    id: 'text',
    reach: 'file',
    name: 'TextEdit',
    icon: '/icons/text-file.svg',
    window: { width: 680, height: 580 },
  },
  {
    id: 'image',
    reach: 'file',
    name: 'Preview',
    icon: '/icons/image-file.svg',
    window: { width: 640, height: 470 },
  },
  {
    id: 'github',
    reach: 'offsite',
    name: 'GitHub',
    icon: '/icons/github.png',
    href: 'https://github.com/ryann254',
  },
  {
    id: 'linkedin',
    reach: 'offsite',
    name: 'LinkedIn',
    icon: '/icons/linkedin.svg',
    href: 'https://linkedin.com/in/ryan-w-3a81a9198',
  },
]

const reaching = (reach: Reach): readonly App[] => apps.filter((app) => app.reach === reach)

/** The dock's own apps, in its left group. */
export const dockApps = reaching('desktop')

/** Apps that take the reader somewhere else. The dock rules them off to the right. */
export const offsiteApps = reaching('offsite')

/** The windows Finder opens on a file. Nowhere else can open them. */
export const fileApps = reaching('file')

export const opensAWindow = (app: App): app is WindowedApp => app.window !== undefined

/** Apps the dock, and later Spotlight and the router, can open on the desktop. */
export const windowedApps: readonly WindowedApp[] = apps.filter(opensAWindow)

/** Apps with an address, which is every route this site has. */
export const addressedApps: readonly WindowedApp[] = windowedApps.filter(
  (app) => app.reach === 'desktop',
)

/**
 * Every app a reader can open from a list: the ones with an address and the ones
 * that leave the site. Launchpad falls out of it by having no window, because it
 * is the list itself, and so do the text and image windows, which need a file
 * Finder has already picked.
 */
export const openableApps: readonly App[] = [...addressedApps, ...offsiteApps]

/** Where an app sits in this list. Windows draw in this order, whatever is in front. */
export const appOrder = (id: AppId): number => apps.findIndex((app) => app.id === id)

/** The app behind a window. Throws rather than opening one for an app that has none. */
export const windowedApp = (id: AppId): WindowedApp => {
  const app = appById(id)
  if (!opensAWindow(app)) throw new Error(`${app.name} does not open a window`)
  return app
}

export const appById = (id: AppId): App => {
  const app = apps.find((entry) => entry.id === id)
  if (!app) throw new Error(`No app called ${id} is in the registry`)
  return app
}
