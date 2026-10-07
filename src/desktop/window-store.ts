'use client'

import { create } from 'zustand'
import { type AppId, windowedApp } from './apps'
import {
  goBack,
  goForward,
  goTo,
  goUp,
  remembered,
  TRAIL_START,
  type Trail,
  trailAfter,
  trailTarget,
} from './finder-trail'
import type { Target } from './routes'
import { type Bounds, isPhone, type Size } from './window-bounds'
import * as windows from './window-state'

/**
 * The client side of `window-state.ts` and `finder-trail.ts`. Every rule lives
 * in those two; this holds the current stack, the current trail, and what is
 * typed in Finder's search box, and reads the viewport, which is the one thing a
 * pure function cannot do for itself.
 *
 * Drag and resize do not come through here while the pointer is down. The frame
 * keeps the live rectangle in its own state and commits it with `place` on
 * release, so a gesture re-renders one window instead of the whole desktop.
 */
export type WindowStore = {
  readonly stack: windows.Desktop
  /**
   * Whether the screen is too narrow for a window manager. The store is the one
   * place allowed to read the viewport, and the frame needs the answer to know
   * whether it is a window or the whole screen, so it is kept here rather than
   * measured again in a component. `refit` is what keeps it true.
   */
  readonly phone: boolean
  /** Where Finder has been. Its back and forward read it, and it outlives the window. */
  readonly trail: Trail
  /** What is typed in Finder's search box. It holds while Finder stands still. */
  readonly finding: string
  readonly open: (target: Target) => void
  /** What an address asks for, which overrides the folder a window is already in. */
  readonly show: (target: Target) => void
  readonly focus: (id: AppId) => void
  readonly close: (id: AppId) => void
  readonly minimize: (id: AppId) => void
  readonly toggleMaximized: (id: AppId) => void
  readonly place: (id: AppId, bounds: Bounds) => void
  readonly refit: (screen: Size) => void
  /** The empty desktop, which is what the address `/` describes. */
  readonly clear: () => void
  /** Finder's own four moves. Each one takes the window with it. */
  readonly goTo: (path: string) => void
  readonly goBack: () => void
  readonly goForward: () => void
  readonly goUp: () => void
  readonly find: (query: string) => void
}

/** The desktop covers the viewport, so the viewport is the screen to clamp against. */
export const viewport = (): Size => ({
  width: globalThis.innerWidth,
  height: globalThis.innerHeight,
})

/** The three things that move together. Everything else on the store stays put. */
type Moved = Pick<WindowStore, 'stack' | 'trail' | 'finding'>

/**
 * Every change to the windows comes through here, so the trail cannot fall
 * behind the folder the Finder window is actually in. There is no path that
 * moves a window and forgets to record it, because there is no other path.
 *
 * A search is of one folder in one window, so it survives exactly as long as
 * Finder is open and standing still.
 */
const moved = (was: WindowStore, stack: windows.Desktop): Moved => {
  const trail = trailAfter(was.trail, stack)
  const stillThere = trail === was.trail && windows.isOpen(stack, 'finder')
  return { stack, trail, finding: stillThere ? was.finding : '' }
}

/** The other direction: the trail moved, so the window goes where it now points. */
const walked = (was: WindowStore, trail: Trail): Moved => ({
  trail,
  finding: trail === was.trail ? was.finding : '',
  stack: windows.show(was.stack, trailTarget(trail), windowedApp('finder').window, viewport()),
})

export const useWindows = create<WindowStore>((set) => ({
  stack: [],
  /* False until the first `refit`, which `window-layer.tsx` runs on mount. The
     server has no viewport to read and a guess here would be one the first
     paint had to take back. Nothing is open on the first paint either way. */
  phone: false,
  trail: TRAIL_START,
  finding: '',
  open: (target) =>
    set((was) => {
      const asked = windows.landed(was.stack, remembered(target, was.trail))
      return moved(was, windows.open(was.stack, asked, windowedApp(asked.app).window, viewport()))
    }),
  show: (target) =>
    set((was) => {
      const asked = windows.landed(was.stack, remembered(target, was.trail))
      return moved(was, windows.show(was.stack, asked, windowedApp(asked.app).window, viewport()))
    }),
  focus: (id) => set((was) => moved(was, windows.focus(was.stack, id))),
  close: (id) => set((was) => moved(was, windows.close(was.stack, id))),
  minimize: (id) => set((was) => moved(was, windows.minimize(was.stack, id))),
  toggleMaximized: (id) => set((was) => moved(was, windows.toggleMaximized(was.stack, id))),
  place: (id, bounds) => set((was) => moved(was, windows.place(was.stack, id, bounds))),
  refit: (screen) =>
    set((was) => ({ ...moved(was, windows.refit(was.stack, screen)), phone: isPhone(screen) })),
  clear: () => set((was) => moved(was, [])),
  goTo: (path) => set((was) => walked(was, goTo(was.trail, path))),
  goBack: () => set((was) => walked(was, goBack(was.trail))),
  goForward: () => set((was) => walked(was, goForward(was.trail))),
  goUp: () => set((was) => walked(was, goUp(was.trail))),
  find: (query) => set({ finding: query }),
}))
