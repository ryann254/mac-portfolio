'use client'

import { AppleLogo } from './apple-logo'
import { appById } from './apps'
import { menuBarTime } from './clock'
import type { Panel } from './panels'
import { useSystem } from './system-store'
import { useClock } from './use-clock'
import { focused } from './window-state'
import { useWindows } from './window-store'

/**
 * The bar across the top. It names whichever window is in front, and Finder
 * when there is none, which is what a Mac with an empty desktop says.
 *
 * Three things on it open a panel: the Apple logo, the magnifying glass, and
 * the Control Centre switches. The named menus beside them are chrome, because
 * a File menu on a portfolio has nothing to put in it.
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
      <Opener panel="apple" label="Apple menu">
        <AppleLogo className="h-[15px] w-[15px] fill-current opacity-90" />
      </Opener>
      <span data-testid="menu-bar-app" className="font-bold">
        {front ? appById(front).name : 'Finder'}
      </span>
      <span className="hidden gap-[17px] md:flex">
        {MENUS.map((menu) => (
          <span key={menu}>{menu}</span>
        ))}
      </span>
      <span className="ml-auto flex items-center gap-[15px]">
        <span className="hidden items-center gap-[13px] sm:flex">
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
        <span data-testid="menu-clock" className="tabular-nums">
          {now ? menuBarTime(now) : ''}
        </span>
      </span>
    </div>
  )
}

/**
 * One of the three buttons that open a panel. Pressing it again closes the
 * panel, which is the rule in `panels.ts` and the reason these are buttons
 * rather than a button and a close button.
 */
function Opener({
  panel,
  label,
  children,
}: {
  panel: Panel
  label: string
  children: React.ReactNode
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
