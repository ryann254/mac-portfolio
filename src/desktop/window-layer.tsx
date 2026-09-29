'use client'

import { useEffect } from 'react'
import { appOrder } from './apps'
import { WindowFrame } from './window-frame'
import { focused } from './window-state'
import { useWindows, viewport } from './window-store'

/**
 * Every open window. The layer itself takes no pointer events, so the desktop
 * behind it stays clickable everywhere a window is not, and it sits under the
 * menu bar and the dock, which is where macOS puts windows.
 *
 * Windows are drawn in registry order, not stacking order, and z-index alone
 * says which one is in front. React moves DOM nodes to match the order it is
 * handed, and a browser drops the pointer capture a drag is holding when the
 * captured element moves, so a stacking-order list turned the first drag of a
 * window behind into a click that only raised it.
 */
export function WindowLayer() {
  const stack = useWindows((store) => store.stack)
  const front = focused(stack)

  /* A window dragged to the right edge of a wide screen would otherwise still
     be out there after the browser narrows, off screen with nothing to grab. */
  useEffect(() => {
    const { refit } = useWindows.getState()
    const onResize = () => refit(viewport())
    globalThis.addEventListener('resize', onResize)
    return () => globalThis.removeEventListener('resize', onResize)
  }, [])
  const drawn = stack
    .map((state, index) => ({ state, z: index + 1 }))
    .sort((one, other) => appOrder(one.state.id) - appOrder(other.state.id))

  return (
    <div data-testid="windows" className="pointer-events-none absolute inset-0 z-40">
      {drawn.map(({ state, z }) => (
        <WindowFrame key={state.id} state={state} z={z} focused={state.id === front} />
      ))}
    </div>
  )
}
