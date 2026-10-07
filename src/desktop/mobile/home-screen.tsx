'use client'

import { type App, openableApps } from '../apps'
import { useWindows } from '../window-store'

/**
 * What a phone shows instead of a desktop. The same apps Launchpad lists, in
 * the same order, because both are reading the registry rather than a list of
 * their own: an app added there turns up here with no edit.
 *
 * It sits under the window layer rather than being swapped out for it, so an
 * open app covers the home screen the way one does on a phone, and closing the
 * app uncovers it with nothing to restore.
 *
 * Spotlight and Control Centre are not here. The bar across the top keeps both
 * buttons at every width, so there is one of each in the page rather than a
 * second pair that only a phone can reach.
 */
export function HomeScreen() {
  return (
    <div
      data-testid="home-screen"
      className="absolute inset-x-0 top-7 bottom-0 z-10 flex flex-col overflow-y-auto overflow-x-hidden px-5 pt-6 pb-28 md:hidden"
    >
      {/* Pushed down, so the welcome keeps the top of the screen and the
          icons sit where a thumb reaches. */}
      <ul role="list" aria-label="Apps" className="mt-auto grid grid-cols-4 gap-x-3 gap-y-5">
        {openableApps.map((app) => (
          <li key={app.id}>
            <Tile app={app} />
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * One app. An offsite app is an anchor because it leaves the site, the same
 * split Launchpad and the dock both make, so a long press offers to open it in
 * a tab the way a link does.
 */
function Tile({ app }: { app: App }) {
  const open = useWindows((store) => store.open)

  const art = (
    <>
      {/* Low priority on purpose: the welcome heading above these is what
          Lighthouse measures as the largest contentful paint, and it is waiting
          on the font. Eight icons fetched ahead of it cost a tenth of a second.
          The dock does the same, for the same reason. */}
      {/* biome-ignore lint/performance/noImgElement: the icons are drawn at one fixed size and already capped at 256 px, and the optimiser refuses the LinkedIn SVG outright without dangerouslyAllowSVG. */}
      <img
        src={app.icon}
        alt=""
        width={60}
        height={60}
        fetchPriority="low"
        className="size-14 rounded-[13px]"
      />
      {/* The same backdrop the desktop's folder labels carry, for the same
          reason: white over the pale half of a wallpaper measures 2.6:1 and a
          text shadow is not enough to fix that. */}
      <span
        data-over-wallpaper
        className="max-w-full truncate rounded bg-black/35 px-1.5 text-center font-medium text-[11px] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]"
      >
        {app.name}
      </span>
    </>
  )

  const skin =
    'flex w-full flex-col items-center gap-1.5 rounded-[14px] focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4'

  if (app.href !== undefined) {
    return (
      <a
        href={app.href}
        target="_blank"
        rel="noopener noreferrer"
        data-home-item={app.id}
        aria-label={`${app.name}, opens in a new tab`}
        className={skin}
      >
        {art}
      </a>
    )
  }

  return (
    <button
      type="button"
      data-home-item={app.id}
      onClick={() => open({ app: app.id })}
      className={skin}
    >
      {art}
    </button>
  )
}
