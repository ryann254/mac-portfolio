'use client'

import { useEffect, useRef, useState } from 'react'
import type { App } from './apps'
import { appsMatching } from './search'
import { putKeyboardIn } from './window-frame'
import { useWindows } from './window-store'

/**
 * Every app a reader can open, over a blurred desktop, with a box that cuts the
 * grid down as they type. The sheet itself takes no pointer events, so pressing
 * the space between the icons closes it the way it does on a Mac, and the dock
 * and the menu bar stay above it and stay usable.
 */
export function Launchpad() {
  const [query, setQuery] = useState('')
  const open = useWindows((store) => store.open)
  const box = useRef<HTMLInputElement>(null)
  const apps = appsMatching(query)

  useEffect(() => {
    box.current?.focus()
  }, [])

  const launch = (app: App) => {
    open({ app: app.id })
    putKeyboardIn(app.id)
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-10 overflow-auto bg-black/40 px-6 pt-14 pb-28 backdrop-blur-2xl motion-safe:animate-[panel-in_160ms_ease-out] dark:bg-black/55">
      <input
        ref={box}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || apps.length === 0) return
          launch(apps[0])
        }}
        aria-label="Search apps"
        placeholder="Search"
        className="pointer-events-auto w-[260px] shrink-0 rounded-lg border-[0.5px] border-white/30 bg-white/20 px-3.5 py-1.5 text-[13px] text-white placeholder:text-white/60 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      />

      {apps.length === 0 ? (
        <p className="text-[13px] text-white/80">Nothing here is called that.</p>
      ) : (
        <ul
          role="list"
          data-testid="launchpad-apps"
          className="grid grid-cols-3 gap-x-10 gap-y-8 sm:grid-cols-5 lg:grid-cols-7"
        >
          {apps.map((app) => (
            <li key={app.id} className="pointer-events-auto">
              {app.href === undefined ? (
                <button type="button" className={TILE} onClick={() => launch(app)}>
                  <Art app={app} />
                </button>
              ) : (
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={TILE}
                  aria-label={`${app.name}, opens in a new tab`}
                >
                  <Art app={app} />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const TILE =
  'flex w-[84px] flex-col items-center gap-2 rounded-xl p-1 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2'

const Art = ({ app }: { app: App }) => (
  <>
    {/* biome-ignore lint/performance/noImgElement: the same icons the dock
        draws, at the same fixed size and already capped at 256 px, so the
        optimiser would charge a round trip each to hand back the same picture. */}
    <img src={app.icon} alt="" width={64} height={64} className="size-16 rounded-[14px]" />
    <span className="text-center text-[12px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
      {app.name}
      {app.href === undefined ? '' : ' ↗'}
    </span>
  </>
)
