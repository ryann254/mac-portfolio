'use client'

import { WindowFrame } from './window-frame'
import { focused } from './window-state'
import { useWindows } from './window-store'

/**
 * Every open window, drawn back to front in the order the store keeps them.
 * The layer itself takes no pointer events, so the desktop behind it stays
 * clickable everywhere a window is not.
 *
 * It sits under the menu bar and the dock, which is where macOS puts windows.
 */
export function WindowLayer() {
  const stack = useWindows((store) => store.stack)
  const front = focused(stack)

  return (
    <div data-testid="windows" className="pointer-events-none absolute inset-0 z-40">
      {stack.map((state, index) => (
        <WindowFrame key={state.id} state={state} index={index} focused={state.id === front} />
      ))}
    </div>
  )
}
