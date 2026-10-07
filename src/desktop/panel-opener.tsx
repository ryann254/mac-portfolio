'use client'

import type { ReactNode } from 'react'
import type { Panel } from './panels'
import { useSystem } from './system-store'

/**
 * A button that opens a panel. Pressing it again closes the panel, which is the
 * rule in `panels.ts` and the reason these are buttons rather than a button and
 * a close button beside it.
 *
 * The menu bar has three and the phone's status bar has one, so this is the one
 * place that knows a panel opener is a toggle and carries the hook the tests
 * reach it by.
 */
export function Opener({
  panel,
  label,
  children,
}: {
  panel: Panel
  label: string
  children: ReactNode
}) {
  const up = useSystem((store) => store.panel === panel)
  const togglePanel = useSystem((store) => store.togglePanel)

  return (
    <button
      type="button"
      data-panel-opener={panel}
      aria-label={label}
      aria-expanded={up}
      onClick={() => togglePanel(panel)}
      className={`-mx-1 flex h-7 items-center rounded px-1 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-[-2px] ${
        up ? 'bg-black/10 dark:bg-white/15' : ''
      }`}
    >
      {children}
    </button>
  )
}
