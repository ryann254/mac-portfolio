'use client'

import { AppleLogo } from './apple-logo'
import { menuBarTime } from './clock'
import { useClock } from './use-clock'

/**
 * The bar across the top. The app name is Finder until phase 4 has a focused
 * window to name, and the menus are chrome rather than controls: the Apple menu
 * gets its Sleep, Lock, and Restart items in phase 8.
 */
const MENUS = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'] as const

export function MenuBar() {
  const now = useClock()

  return (
    <div className="absolute inset-x-0 top-0 z-[75] flex h-7 items-center gap-4 bg-white/45 px-3 text-[13px] text-zinc-900 backdrop-blur-xl backdrop-saturate-[1.8] dark:bg-zinc-900/45 dark:text-zinc-50">
      <AppleLogo className="h-[15px] w-[15px] fill-current opacity-90" />
      <span className="font-bold">Finder</span>
      <span className="hidden gap-[17px] md:flex">
        {MENUS.map((menu) => (
          <span key={menu}>{menu}</span>
        ))}
      </span>
      <span className="ml-auto flex items-center gap-[15px]">
        <span className="hidden items-center gap-[15px] sm:flex">
          <StatusIcon
            title="Wi-Fi"
            path="M12 18.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0-4.6c1.3 0 2.5.5 3.4 1.4l-1.4 1.4a2.9 2.9 0 0 0-4 0l-1.4-1.4a4.8 4.8 0 0 1 3.4-1.4zm0-4.2c2.4 0 4.6.9 6.3 2.5l-1.4 1.4a7 7 0 0 0-9.8 0l-1.4-1.4A8.9 8.9 0 0 1 12 9.7zm0-4.2c3.5 0 6.7 1.3 9.1 3.5l-1.4 1.4a11.2 11.2 0 0 0-15.4 0L2.9 9A13.1 13.1 0 0 1 12 5.5z"
          />
          <StatusIcon
            title="Battery"
            path="M5 7h14a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm1 1.6v4.8h12V8.6H6zm15 .9h1v3h-1z"
          />
          <StatusIcon
            title="Spotlight"
            path="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
          />
          <StatusIcon
            title="Control Centre"
            path="M5 6h6a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2zm0 5h14a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2zm0 5h9a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2z"
          />
        </span>
        <span data-testid="menu-clock" className="tabular-nums">
          {now ? menuBarTime(now) : ''}
        </span>
      </span>
    </div>
  )
}

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
