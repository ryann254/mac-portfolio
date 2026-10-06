'use client'

import { create } from 'zustand'
import { type Panel, panelAfter } from './panels'
import { next, type SystemEvent, type SystemState } from './system-state'

/**
 * The client side of `system-state.ts` and `panels.ts`: what the machine is
 * doing and which panel is up. Neither is remembered across a reload, because
 * a reader who comes back wants a desktop rather than the lock screen they
 * left, and the one thing that is remembered, how the desktop looks, is in
 * `appearance-store.ts`.
 */
export type SystemStore = {
  readonly state: SystemState
  readonly panel: Panel | undefined
  /** Sends an event to the machine. One it has no rule for changes nothing. */
  readonly send: (event: SystemEvent) => void
  /** Opens a panel, or closes it when it is the one already up. */
  readonly togglePanel: (panel: Panel) => void
  readonly closePanel: () => void
}

export const useSystem = create<SystemStore>((set) => ({
  state: 'booting',
  panel: undefined,
  /* Every event but the boot's own comes from a menu, and a menu left standing
     behind the lock screen is still standing when the reader gets back in. */
  send: (event) => set((was) => ({ state: next(was.state, event), panel: undefined })),
  togglePanel: (panel) => set((was) => ({ panel: panelAfter(was.panel, panel) })),
  closePanel: () => set({ panel: undefined }),
}))
