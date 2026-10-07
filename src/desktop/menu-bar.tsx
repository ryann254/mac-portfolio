'use client'

import { AppleLogo } from './apple-logo'
import { appById } from './apps'
import { menuBarTime } from './clock'
import { Opener } from './panel-opener'
import { useClock } from './use-clock'
import { focused } from './window-state'
import { useWindows } from './window-store'

/**
 * The bar across the top. On a desktop it is the menu bar: it names whichever
 * window is in front, and Finder when there is none, which is what a Mac with
 * an empty desktop says. On a phone the same strip is the status bar, with the
 * clock on the left and the system icons on the right.
 *
 * It is one bar rather than two components, because four of the things on it
 * are the same at both sizes and a second copy of the Control Centre button
 * would be a second element answering to the same name. What differs is what is
 * hidden and where the clock sits, which is what `order` is for.
 *
 * Three things on it open a panel: the Apple logo, the magnifying glass, and
 * the Control Centre switches. A phone has no use for the Apple menu, whose
 * items are a joke about a desktop, so that one goes. The named menus beside it
 * are chrome, because a File menu on a portfolio has nothing to put in it.
 */
const MENUS = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'] as const

const GLASS =
  'M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z'
const SWITCHES =
  'M5 6h6a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2zm0 5h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2zm0 5h9a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2z'

export function MenuBar() {
  const now = useClock()
  const front = useWindows((store) => focused(store.stack))

  return (
    <div className="absolute inset-x-0 top-0 z-[75] flex h-7 items-center gap-4 bg-white/45 px-3 text-[13px] text-zinc-900 backdrop-blur-xl backdrop-saturate-[1.8] dark:bg-zinc-900/45 dark:text-zinc-50">
      <span className="hidden md:flex">
        <Opener panel="apple" label="Apple menu">
          <AppleLogo className="h-[15px] w-[15px] fill-current opacity-90" />
        </Opener>
      </span>
      <span data-testid="menu-bar-app" className="hidden font-bold md:inline">
        {front ? appById(front).name : 'Finder'}
      </span>
      <span className="hidden gap-[17px] md:flex">
        {MENUS.map((menu) => (
          <span key={menu}>{menu}</span>
        ))}
      </span>
      <span className="ml-auto flex items-center gap-[15px]">
        <StatusIcon
          title="Wi-Fi"
          path="M12 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0-4.6c1.3 0 2.5.5 3.4 1.4l-1.4 1.4a2.9 2.9 0 0 0-4 0l-1.4-1.4a4.8 4.8 0 0 1 3.4-1.4zm0-4.2c2.4 0 4.6.9 6.3 2.5l-1.4 1.4a7 7 0 0 0-9.8 0l-1.4-1.4A8.9 8.9 0 0 1 12 9.7zm0-4.2c3.5 0 6.7 1.3 9.1 3.5l-1.4 1.4a11.2 11.2 0 0 0-15.4 0L2.9 9A13.1 13.1 0 0 1 12 5.5z"
        />
        <StatusIcon
          title="Battery"
          path="M5 7h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm1 1.6v4.8h12V8.6H6zm15 .9h1v3h-1z"
        />
        <Opener panel="spotlight" label="Spotlight Search">
          <Glyph path={GLASS} />
        </Opener>
        <Opener panel="control-centre" label="Control Centre">
          <Glyph path={SWITCHES} />
        </Opener>
      </span>
      {/* Last in the markup and last on a desktop. On a phone it moves to the
          front of the row and takes the spare space with it, which is where a
          phone puts the time. */}
      <span
        data-testid="menu-clock"
        className="tabular-nums max-md:order-first max-md:mr-auto max-md:font-semibold"
      >
        {now ? menuBarTime(now) : ''}
      </span>
    </div>
  )
}

const Glyph = ({ path }: { path: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current opacity-85">
    <path d={path} />
  </svg>
)

const StatusIcon = ({ title, path }: { title: string; path: string }) => (
  <svg
    viewBox="0 0 24 24"
    role="img"
    aria-label={title}
    className="h-4 w-4 fill-current opacity-85"
  >
    <path d={path} />
  </svg>
)
