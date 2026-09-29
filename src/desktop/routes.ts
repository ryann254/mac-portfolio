import { projects } from '@/content'
import { type AppId, appById, windowedApps } from './apps'
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

/** What the 404 window is on. It is Finder, at an address nothing answers to. */
export const NOT_FOUND = 'not-found'

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
 * Where the address bar points with this window in front. Undefined for the 404
 * window, which stands in for an address nothing answers to and so leaves the
 * one the reader typed alone.
 */
export function routeOf(target: Target | undefined): string | undefined {
  if (!target) return '/'
  if (target.showing === NOT_FOUND) return undefined
  return target.showing ? `/${target.app}/${target.showing}` : `/${target.app}`
}

/** The window an address asks for. Undefined for `/` and for anything ungenerated. */
export function targetAt(path: string): Target | undefined {
  const [app, showing, ...rest] = path.split('/').filter(Boolean)
  const found = windowedApps.find((entry) => entry.id === app)
  if (!found || rest.length > 0) return undefined
  if (showing === undefined) return { app: found.id }
  return showingsOf(found.id).some((entry) => entry.slug === showing)
    ? { app: found.id, showing }
    : undefined
}

/** Every address the site answers to, which is what the build has to prerender. */
export const routes: readonly string[] = [
  '/',
  ...windowedApps.flatMap((app) => [
    `/${app.id}`,
    ...showingsOf(app.id).map((entry) => `/${app.id}/${entry.slug}`),
  ]),
]

/** Finder is titled by the folder it is in, Safari by the project it is on. */
export function windowTitle(target: Target): string {
  if (target.showing === NOT_FOUND) return 'File not found'
  const showing = showingsOf(target.app).find((entry) => entry.slug === target.showing)
  return showing?.name ?? appById(target.app).name
}
