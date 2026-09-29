'use client'

import { useEffect } from 'react'
import type { Target } from './routes'
import { useWindows } from './window-store'

/**
 * The page's half of the routing. A route knows which window it is; this opens
 * it once the desktop is on screen. It draws nothing, because the desktop
 * around it is the page.
 */
export function OpenOnLoad({ app, showing }: Target) {
  useEffect(() => {
    useWindows.getState().open({ app, showing })
  }, [app, showing])
  return null
}
