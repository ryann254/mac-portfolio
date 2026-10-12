import type { ReactNode } from 'react'
import { BootScreen } from './boot-screen'
import { DeskClock } from './desk-clock'
import { DeskFolders } from './desk-folders'
import { Dock } from './dock'
import { MenuBar } from './menu-bar'
import { HomeScreen } from './mobile/home-screen'
import { PanelLayer } from './panel-layer'
import { SystemCurtain } from './system-curtain'
import { Wallpaper } from './wallpaper'
import { Welcome } from './welcome'
import { WindowLayer } from './window-layer'

/**
 * The whole screen, which every address on this site shares. It is the layout
 * rather than a page because a route here does not change the desktop, it only
 * says which window opens on it, and that is all a page renders.
 *
 * Under 768px the middle of the screen is a phone's home screen instead of the
 * desktop's folders, and the bar across the top restyles itself into a status
 * bar. Which one is drawn is CSS rather than a width read in JavaScript,
 * because this is prerendered and every reader is handed the same HTML, so a
 * layout picked after hydration would show most of them the wrong one first.
 *
 * Everything else is shared rather than copied: one wallpaper, one dock, one
 * window layer, one set of panels, one boot. A phone is this desktop with its
 * windows filling the screen, which is what `window-store.ts` decides.
 */
export function Desktop({ children }: { children: ReactNode }) {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <DeskFolders />
      <HomeScreen />
      <Welcome />
      <DeskClock />
      <WindowLayer />
      <Dock />
      <PanelLayer />
      <BootScreen />
      <SystemCurtain />
      {/* What the brightness slider does. It takes no pointer events, so a
          dimmed screen is still a working one, and at full brightness it is
          transparent and costs the page nothing. */}
      <div
        data-dim=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[100] bg-black"
      />
      {children}
    </main>
  )
}
