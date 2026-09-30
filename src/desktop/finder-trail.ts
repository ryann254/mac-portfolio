import { HOME, parentOf } from './file-tree'
import type { Target } from './routes'
import type { Desktop } from './window-state'
import { find } from './window-state'

/**
 * Where Finder has been, and where in that list it is now. It is Finder's back
 * and forward, kept apart from the browser's: pressing back in a Finder window
 * should go up out of a project folder, not leave for whatever window the
 * reader had open before this one.
 *
 * Every move that cannot be made hands back the trail it was given, which is
 * what makes the three boundaries one rule instead of three: back at the
 * beginning, forward at the end, and up from a folder in the sidebar all leave
 * Finder exactly where it is.
 *
 * The trail outlives the window. Closing Finder and opening it again comes back
 * to the folder it was left in, the way reopening a real Finder does.
 */
export type Trail = {
  /** Every folder Finder has been in, oldest first. */
  readonly seen: readonly string[]
  /** Which one of them it is in now. */
  readonly at: number
}

export const TRAIL_START: Trail = { seen: [HOME], at: 0 }

export const where = (trail: Trail): string => trail.seen[trail.at]

export const canGoBack = (trail: Trail): boolean => trail.at > 0

export const canGoForward = (trail: Trail): boolean => trail.at < trail.seen.length - 1

export const goBack = (trail: Trail): Trail =>
  canGoBack(trail) ? { ...trail, at: trail.at - 1 } : trail

export const goForward = (trail: Trail): Trail =>
  canGoForward(trail) ? { ...trail, at: trail.at + 1 } : trail

/**
 * Somewhere new. Whatever forward was holding goes, the way a browser drops it
 * when you go back and then somewhere else, and going where you already are
 * leaves the trail alone so no folder is in it twice in a row.
 */
export const goTo = (trail: Trail, path: string): Trail =>
  path === where(trail)
    ? trail
    : { seen: [...trail.seen.slice(0, trail.at + 1), path], at: trail.at + 1 }

export const canGoUp = (trail: Trail): boolean => parentOf(where(trail)) !== undefined

/** Up is somewhere new like anywhere else, so back undoes it. */
export const goUp = (trail: Trail): Trail => {
  const parent = parentOf(where(trail))
  return parent === undefined ? trail : goTo(trail, parent)
}

/**
 * The trail after the windows moved. The folder the Finder window is in is the
 * truth and this only records it, so the address bar, the dock, and the folders
 * on the desktop all end up in the trail without any of them knowing about it.
 */
export const trailAfter = (trail: Trail, desktop: Desktop): Trail => {
  const at = find(desktop, 'finder')?.showing
  return at === undefined ? trail : goTo(trail, at)
}

/** Where the trail says Finder is, in the shape the window rules take. */
export const trailTarget = (trail: Trail): Target => ({ app: 'finder', showing: where(trail) })

/**
 * A dock icon and a bare `/finder` name no folder, so Finder goes back to the
 * one the trail was left in rather than starting over.
 */
export const remembered = (target: Target, trail: Trail): Target =>
  target.app === 'finder' && target.showing === undefined ? trailTarget(trail) : target
