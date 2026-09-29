'use client'

import { useEffect } from 'react'
import { routeOf, targetAt } from './routes'
import { frontTarget } from './window-state'
import { useWindows } from './window-store'

/**
 * Keeps the address bar and the windows in step, in the one place, so no call
 * site has to remember the URL and no URL has to remember the windows.
 *
 * The address is whichever window is in front. Opening one pushes a history
 * entry, so back undoes the open; focusing, closing, and minimising replace it,
 * because bringing a window forward is not somewhere new to go back from.
 * Neither happens when the address is already right, which is what stops going
 * back from pushing the entry the reader just left.
 */
export function useWindowUrl(): void {
  useEffect(() => {
    const stop = useWindows.subscribe((state, before) => {
      const route = routeOf(frontTarget(state.stack))
      if (route === undefined || route === globalThis.location.pathname) return
      const opened = state.stack.length > before.stack.length
      if (opened) globalThis.history.pushState(null, '', route)
      else globalThis.history.replaceState(null, '', route)
    })

    /* Back and forward hand us an address and nothing else, so the desktop is
       built from it: the window it names comes to the front, and `/` is the
       desktop with nothing on it, which is what makes back undo an open. */
    const onPop = () => {
      const { open, clear } = useWindows.getState()
      const target = targetAt(globalThis.location.pathname)
      if (target) open(target)
      else clear()
    }

    globalThis.addEventListener('popstate', onPop)
    return () => {
      stop()
      globalThis.removeEventListener('popstate', onPop)
    }
  }, [])
}
