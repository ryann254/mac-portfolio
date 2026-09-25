import type { AppId } from './apps'
import { type Bounds, openingBounds, type Size } from './window-bounds'

/**
 * Which windows are up and which one is in front. Pure, so every rule a reader
 * meets with a mouse is readable in `window-state.test.ts` without a browser.
 *
 * The stack is an array in stacking order rather than a z-index per window,
 * which is how two rules stop being code: the front window is the last one, and
 * closing it hands the front to whatever was under it.
 */
export type WindowState = {
  readonly id: AppId
  readonly bounds: Bounds
  /** Hidden, but still in the stack and still the size the reader left it. */
  readonly minimized: boolean
  /** Drawn against the desktop's edges instead of `bounds`, so restoring is exact. */
  readonly maximized: boolean
}

/** Back to front. The last window that is not minimised has the focus. */
export type Desktop = readonly WindowState[]

export const find = (desktop: Desktop, id: AppId): WindowState | undefined =>
  desktop.find((entry) => entry.id === id)

export const isOpen = (desktop: Desktop, id: AppId): boolean => find(desktop, id) !== undefined

export function focused(desktop: Desktop): AppId | undefined {
  for (let index = desktop.length - 1; index >= 0; index -= 1) {
    if (!desktop[index].minimized) return desktop[index].id
  }
  return undefined
}

/**
 * Brings a window to the front, and back from the dock if it was minimised.
 * A window that is already there comes back as the same array, so pressing on
 * the front window does not re-render the desktop underneath it.
 */
export function focus(desktop: Desktop, id: AppId): Desktop {
  const window = find(desktop, id)
  if (!window) return desktop
  if (!window.minimized && desktop[desktop.length - 1] === window) return desktop
  return [...desktop.filter((entry) => entry.id !== id), { ...window, minimized: false }]
}

/** Opening an app that is already up focuses it, the way clicking its dock icon does. */
export function open(desktop: Desktop, id: AppId, size: Size, screen: Size): Desktop {
  if (isOpen(desktop, id)) return focus(desktop, id)
  return [
    ...desktop,
    {
      id,
      bounds: openingBounds(size, screen, desktop.length),
      minimized: false,
      maximized: false,
    },
  ]
}

export const close = (desktop: Desktop, id: AppId): Desktop =>
  desktop.filter((entry) => entry.id !== id)

const change = (desktop: Desktop, id: AppId, edit: (window: WindowState) => WindowState): Desktop =>
  desktop.map((entry) => (entry.id === id ? edit(entry) : entry))

export const minimize = (desktop: Desktop, id: AppId): Desktop =>
  change(desktop, id, (window) => ({ ...window, minimized: true }))

export const toggleMaximized = (desktop: Desktop, id: AppId): Desktop =>
  focus(
    change(desktop, id, (window) => ({ ...window, maximized: !window.maximized })),
    id,
  )

/** Where a drag or a resize leaves the window. The gesture has already clamped it. */
export const place = (desktop: Desktop, id: AppId, bounds: Bounds): Desktop =>
  change(desktop, id, (window) => ({ ...window, bounds }))
