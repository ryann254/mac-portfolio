'use client'

import { useSystem } from './system-store'

/**
 * What the Apple logo drops down. Four of the five items are the system state
 * machine in `system-state.ts`, which is why Sleep, Lock Screen, Restart, and
 * Shut Down are one line each here and the curtain each of them raises is
 * somebody else's job.
 */
export function AppleMenu() {
  const send = useSystem((store) => store.send)
  const togglePanel = useSystem((store) => store.togglePanel)

  const items: readonly { readonly label: string; readonly press: () => void }[] = [
    { label: 'About This Site', press: () => togglePanel('about') },
    { label: 'Sleep', press: () => send('sleep') },
    { label: 'Lock Screen', press: () => send('lock') },
    { label: 'Restart', press: () => send('restart') },
    { label: 'Shut Down', press: () => send('shut-down') },
  ]

  return (
    /* A labelled list of buttons rather than a `nav` or an ARIA menu. These are
       five things to do rather than five places to go, and the ARIA menu
       pattern would take them all off Tab and behind the arrow keys, which is
       the same trade Safari's tab strip turned down in phase 7. */
    <div
      data-testid="apple-menu"
      className="pointer-events-auto absolute top-7 left-1.5 w-[208px] rounded-lg border-[0.5px] border-black/15 bg-white/80 p-1.5 shadow-[0_16px_44px_rgba(0,0,0,0.3)] backdrop-blur-2xl backdrop-saturate-150 motion-safe:animate-[panel-in_120ms_ease-out] dark:border-white/15 dark:bg-zinc-800/80"
    >
      <ul role="list" aria-label="Apple menu" className="text-[13px]">
        {items.map((item, index) => (
          <li
            key={item.label}
            /* macOS rules a line under About This Mac, which is the only item
               in this menu that opens something rather than doing something. */
            className={
              index === 1
                ? 'mt-1.5 border-black/10 border-t pt-1.5 dark:border-white/10'
                : undefined
            }
          >
            <button
              type="button"
              onClick={item.press}
              className="w-full rounded-[5px] px-2.5 py-[5px] text-left text-zinc-900 hover:bg-sky-600 hover:text-white focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-1 dark:text-zinc-100"
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
