/**
 * Where a window sits and how big it is. Pure arithmetic over rectangles, with
 * no React and no DOM, so the rules a reader can feel with a pointer are the
 * same ones the unit tests read.
 *
 * Maximised windows are not in here. They are drawn against the desktop's own
 * edges in CSS, so their bounds never change and restoring one is free.
 */

export type Bounds = {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** A width and a height, used for both a window's size and the desktop's. */
export type Size = { readonly width: number; readonly height: number }

/** The menu bar, `h-7` in `menu-bar.tsx`. No title bar is allowed under it. */
export const MENU_BAR = 28

/** The title bar a window is dragged by, and the last thing allowed off screen. */
export const TITLE_BAR = 30

/** How much of a window has to stay on screen sideways to be draggable back. */
export const KEEP_ON_SCREEN = 90

export const MIN_SIZE = { width: 300, height: 190 } as const

/** Each new window steps down and right from the one before, as macOS does. */
export const CASCADE = 26

/** The eight directions a window can be pulled in, and the edges each one moves. */
export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

/**
 * -1 moves the left or top edge, 1 moves the right or bottom edge, 0 leaves the
 * axis alone. Every resize is this table plus one subtraction, which is why
 * there is no branch per handle anywhere in the component.
 */
export const HANDLES: Record<Handle, { readonly x: -1 | 0 | 1; readonly y: -1 | 0 | 1 }> = {
  n: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  e: { x: 1, y: 0 },
  w: { x: -1, y: 0 },
  ne: { x: 1, y: -1 },
  nw: { x: -1, y: -1 },
  se: { x: 1, y: 1 },
  sw: { x: -1, y: 1 },
}

export const handles = Object.keys(HANDLES) as readonly Handle[]

const between = (low: number, value: number, high: number): number =>
  Math.min(Math.max(value, low), Math.max(low, high))

/**
 * Keeps a dragged window reachable: the title bar never hides under the menu
 * bar or past the bottom edge, and a strip of it stays on screen sideways.
 */
export function clampPosition(bounds: Bounds, screen: Size): Bounds {
  return {
    ...bounds,
    x: between(KEEP_ON_SCREEN - bounds.width, bounds.x, screen.width - KEEP_ON_SCREEN),
    y: between(MENU_BAR, bounds.y, screen.height - TITLE_BAR),
  }
}

export const moveBy = (start: Bounds, dx: number, dy: number, screen: Size): Bounds =>
  clampPosition({ ...start, x: start.x + dx, y: start.y + dy }, screen)

/**
 * Drags one edge, or two for a corner. A leading edge moves the window's origin
 * as well as its size, so the opposite edge stays where the reader put it.
 */
export function resizeBy(
  handle: Handle,
  start: Bounds,
  dx: number,
  dy: number,
  screen: Size,
): Bounds {
  const pull = HANDLES[handle]
  const width = sizeAlong(pull.x, start.x, start.width, dx, MIN_SIZE.width, 0, screen.width)
  const height = sizeAlong(
    pull.y,
    start.y,
    start.height,
    dy,
    MIN_SIZE.height,
    MENU_BAR,
    screen.height,
  )
  return {
    x: pull.x === -1 ? start.x + start.width - width : start.x,
    y: pull.y === -1 ? start.y + start.height - height : start.y,
    width,
    height,
  }
}

/**
 * One axis of a resize. `low` and `high` are the desktop's edges on that axis,
 * and they cap the size so the edge being dragged stops at the screen instead
 * of pushing the opposite edge off it.
 */
function sizeAlong(
  pull: -1 | 0 | 1,
  origin: number,
  size: number,
  delta: number,
  minimum: number,
  low: number,
  high: number,
): number {
  if (pull === 0) return size
  const grown = pull === 1 ? size + delta : size - delta
  const room = pull === 1 ? high - origin : origin + size - low
  return between(minimum, grown, Math.max(minimum, room))
}

/** Where a window lands when it opens: centred, stepped down for each one already up. */
export function openingBounds(size: Size, screen: Size, already: number): Bounds {
  const width = Math.min(size.width, Math.max(MIN_SIZE.width, screen.width - 2 * CASCADE))
  const height = Math.min(
    size.height,
    Math.max(MIN_SIZE.height, screen.height - MENU_BAR - 2 * CASCADE),
  )
  const step = CASCADE * already
  return clampPosition(
    {
      x: Math.round((screen.width - width) / 2) + step,
      y: Math.round(MENU_BAR + (screen.height - MENU_BAR - height) / 2.6) + step,
      width,
      height,
    },
    screen,
  )
}
