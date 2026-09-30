import { projects } from '@/content'
import { type AppId, addressedApps, appById } from './apps'
import { nameAt } from './file-tree'
import { locations } from './locations'

/**
 * The URL space. Every address on this site names a window, so a reader can
 * send someone the link to exactly what they are looking at, and `/` names the
 * desktop with nothing on it.
 *
 * Routes are generated from the app registry rather than written down, so an
 * app gets its route by being added to `apps.ts` and nowhere else.
 */
export type Target = {
  readonly app: AppId
  /** The second segment: the folder Finder is in, or the project Safari is on. */
  readonly showing?: string
}

/** What the 404 window is on. It is Finder, at a folder the tree does not have. */
export const NOT_FOUND = 'not-found'

/** What a window on a folder or a file that is not there calls itself. */
export const MISSING_TITLE = 'File not found'

/** The window an address nothing answers to opens, wherever that is noticed. */
export const MISSING: Target = { app: 'finder', showing: NOT_FOUND }

type Showing = { readonly slug: string; readonly name: string }

/**
 * What each app answers to in the second segment, and what its title bar says
 * on each one. Finder has its sidebar, Safari has the projects, and every other
 * app is one window with one address.
 */
const showings: Partial<Record<AppId, readonly Showing[]>> = {
  finder: locations,
  safari: projects.map((project) => ({ slug: project.slug, name: project.name })),
}

export const showingsOf = (app: AppId): readonly Showing[] => showings[app] ?? []

/**
 * Where the address bar points with this window in front, and undefined when
 * nothing points at it. Three windows have no address and they all fail the same
 * check rather than each getting a rule: the text and image windows, because
 * only a file names one of those and an address carries no file; a folder deeper
 * in Finder than the sidebar goes; and the 404, which is Finder at a folder that
 * is not there and so leaves the address the reader typed alone.
 */
export function routeOf(target: Target | undefined): string | undefined {
  if (!target) return '/'
  if (!addressedApps.some((app) => app.id === target.app)) return undefined
  if (target.showing === undefined) return `/${target.app}`
  return showingsOf(target.app).some((entry) => entry.slug === target.showing)
    ? `/${target.app}/${target.showing}`
    : undefined
}

/** The window an address asks for. Undefined for `/` and for anything ungenerated. */
export function targetAt(path: string): Target | undefined {
  const [app, showing, ...rest] = path.split('/').filter(Boolean)
  const found = addressedApps.find((entry) => entry.id === app)
  if (!found || rest.length > 0) return undefined
  if (showing === undefined) return { app: found.id }
  return showingsOf(found.id).some((entry) => entry.slug === showing)
    ? { app: found.id, showing }
    : undefined
}

/** Every address the site answers to, which is what the build has to prerender. */
export const routes: readonly string[] = [
  '/',
  ...addressedApps.flatMap((app) => [
    `/${app.id}`,
    ...showingsOf(app.id).map((entry) => `/${app.id}/${entry.slug}`),
  ]),
]

/**
 * Finder is titled by the folder it is in, Safari by the project it is on, and
 * the text and image windows by the file they are on. Whatever a window is
 * showing is looked up first against what has an address, then against the file
 * tree, and a window on something neither of them knows is on a miss.
 */
export function windowTitle(target: Target): string {
  if (target.showing === undefined) return appById(target.app).name
  const listed = showingsOf(target.app).find((entry) => entry.slug === target.showing)
  return listed?.name ?? nameAt(target.showing) ?? MISSING_TITLE
}
