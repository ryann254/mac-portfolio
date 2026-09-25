'use client'

import { type ReactNode, useEffect, useRef } from 'react'
import { type App, offsiteApps, opensAWindow, siteApps } from './apps'
import { isOpen } from './window-state'
import { useWindows } from './window-store'

/** How much bigger the icon under the pointer gets. */
const GROWTH = 0.5
/** How many icons either side of the pointer the wave reaches. */
const REACH = 2.7
/** Pixels the biggest icon rises. */
const LIFT = 15

type Geometry = {
  left: number
  scale: number
  reach: number
  centres: number[]
}

export function Dock() {
  const dock = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = dock.current
    if (!element) return
    const items = Array.from(element.querySelectorAll<HTMLElement>('[data-dock-item]'))
    if (items.length === 0) return

    const still = window.matchMedia('(prefers-reduced-motion: reduce)')
    let pending = 0
    let geometry: Geometry | undefined

    /* Measured once when the pointer arrives. Transforms do not move
       `offsetLeft`, and nothing else shifts while you are over the dock, so
       reading any of this per frame would only buy a forced layout on every
       one of them. Doing exactly that cost 11 ms a frame in phase 2. */
    const measure = (): Geometry => ({
      left: element.getBoundingClientRect().left,
      scale: element.getBoundingClientRect().width / element.offsetWidth,
      reach: items[0].offsetWidth * REACH,
      centres: items.map((item) => item.offsetLeft + item.offsetWidth / 2),
    })

    const magnify = (clientX: number) => {
      pending = 0
      const at = geometry
      if (!at) return
      const x = (clientX - at.left) / at.scale
      items.forEach((item, index) => {
        const away = Math.abs(x - at.centres[index])
        const fall = Math.cos((Math.min(1, away / at.reach) * Math.PI) / 2) ** 2
        const grow = GROWTH * fall
        item.style.transform =
          grow < 0.004 ? '' : `scale(${1 + grow}) translateY(${-LIFT * fall}px)`
      })
    }

    const rest = () => {
      if (pending) cancelAnimationFrame(pending)
      pending = 0
      geometry = undefined
      element.removeAttribute('data-live')
      for (const item of items) item.style.transform = ''
    }

    const onMove = (event: PointerEvent) => {
      if (still.matches || event.pointerType === 'touch') return
      if (!geometry) {
        geometry = measure()
        element.setAttribute('data-live', '')
      }
      const { clientX } = event
      if (!pending) pending = requestAnimationFrame(() => magnify(clientX))
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', rest)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', rest)
      if (pending) cancelAnimationFrame(pending)
    }
  }, [])

  return (
    <div
      ref={dock}
      data-dock=""
      data-testid="dock"
      className="-translate-x-1/2 absolute bottom-2.5 left-1/2 z-[76] rounded-[20px] border-[0.5px] border-white/35 bg-white/25 p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.28)] backdrop-blur-xl backdrop-saturate-[1.7] dark:border-white/15 dark:bg-zinc-700/40"
    >
      <ul role="list" aria-label="Dock" className="flex items-end gap-[5px] sm:gap-[7px]">
        {siteApps.map((app) => (
          <DockItem key={app.id} app={app} />
        ))}
        <li aria-hidden="true" className="my-1 mx-[3px] w-px self-stretch bg-white/35" />
        {offsiteApps.map((app) => (
          <DockItem key={app.id} app={app} />
        ))}
      </ul>
    </div>
  )
}

function DockItem({ app }: { app: App }) {
  const open = useWindows((store) => isOpen(store.stack, app.id))
  const show = useWindows((store) => store.open)

  const art = (
    <>
      <Label>
        {app.name}
        {app.offsite ? ' \u2197' : ''}
      </Label>
      {/* Low priority and lazy on purpose: the boot screen covers the dock for
          the first second and a half, and React would otherwise preload all
          nine ahead of the font the welcome heading is waiting on. */}
      {/* biome-ignore lint/performance/noImgElement: the icons are drawn at one
          fixed size and already capped at 256 px, so the optimiser would charge
          a round trip each to hand back the same picture, and it refuses the
          LinkedIn SVG outright without dangerouslyAllowSVG. */}
      <img
        src={app.icon}
        alt=""
        width={50}
        height={50}
        loading="lazy"
        fetchPriority="low"
        className="block size-9 rounded-[11px] sm:size-[50px]"
      />
      <span
        data-testid={`running-${app.id}`}
        className={`mt-[3px] size-1 rounded-full bg-black/60 dark:bg-white/75 ${open ? 'opacity-100' : 'opacity-0'}`}
      />
    </>
  )

  const shared =
    'group relative flex w-9 flex-col items-center rounded-xl focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[3px] sm:w-[50px]'

  if (app.offsite) {
    return (
      <li>
        <a
          data-dock-item=""
          href={app.href}
          target="_blank"
          rel="noreferrer"
          className={shared}
          aria-label={`${app.name}, opens in a new tab`}
        >
          {art}
        </a>
      </li>
    )
  }

  if (opensAWindow(app)) {
    return (
      <li>
        <button
          type="button"
          data-dock-item=""
          className={shared}
          aria-label={app.name}
          onClick={() => show(app)}
        >
          {art}
        </button>
      </li>
    )
  }

  /* Launchpad is a full-screen overlay rather than a window, and phase 8 builds
     it, so it is drawn rather than made into a button that does nothing. */
  return (
    <li>
      <span data-dock-item="" className={shared}>
        {art}
      </span>
    </li>
  )
}

const Label = ({ children }: { children: ReactNode }) => (
  <span className="pointer-events-none absolute bottom-full mb-3 whitespace-nowrap rounded-md border-[0.5px] border-black/15 bg-zinc-100/90 px-2.5 py-[3px] text-[12px] text-zinc-900 opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.2)] group-focus-visible:opacity-100 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-150">
    {children}
  </span>
)
