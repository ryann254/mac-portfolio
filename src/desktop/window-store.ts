'use client'

import { create } from 'zustand'
import type { AppId, WindowedApp } from './apps'
import type { Bounds, Size } from './window-bounds'
import * as windows from './window-state'

/**
 * The client side of `window-state.ts`. Every rule lives in that module; this
 * one only holds the current stack and reads the viewport, which is the one
 * thing a pure function cannot do for itself.
 *
 * Drag and resize do not come through here while the pointer is down. The frame
 * keeps the live rectangle in its own state and commits it with `place` on
 * release, so a gesture re-renders one window instead of the whole desktop.
 */
export type WindowStore = {
  readonly stack: windows.Desktop
  readonly open: (app: WindowedApp) => void
  readonly focus: (id: AppId) => void
  readonly close: (id: AppId) => void
  readonly minimize: (id: AppId) => void
  readonly toggleMaximized: (id: AppId) => void
  readonly place: (id: AppId, bounds: Bounds) => void
}

/** The desktop covers the viewport, so the viewport is the screen to clamp against. */
export const viewport = (): Size => ({
  width: globalThis.innerWidth,
  height: globalThis.innerHeight,
})

export const useWindows = create<WindowStore>((set) => ({
  stack: [],
  open: (app) =>
    set((state) => ({ stack: windows.open(state.stack, app.id, app.window, viewport()) })),
  focus: (id) => set((state) => ({ stack: windows.focus(state.stack, id) })),
  close: (id) => set((state) => ({ stack: windows.close(state.stack, id) })),
  minimize: (id) => set((state) => ({ stack: windows.minimize(state.stack, id) })),
  toggleMaximized: (id) => set((state) => ({ stack: windows.toggleMaximized(state.stack, id) })),
  place: (id, bounds) => set((state) => ({ stack: windows.place(state.stack, id, bounds) })),
}))
