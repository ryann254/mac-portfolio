import type { ReactNode } from 'react'
import { BootScreen } from './boot-screen'
import { DeskClock } from './desk-clock'
import { DeskFolders } from './desk-folders'
import { Dock } from './dock'
import { MenuBar } from './menu-bar'
import { Wallpaper } from './wallpaper'
import { Welcome } from './welcome'
import { WindowLayer } from './window-layer'

/**
 * The whole screen, which every address on this site shares. It is the layout
 * rather than a page because a route here does not change the desktop, it only
 * says which window opens on it, and that is all a page renders.
 */
export function Desktop({ children }: { children: ReactNode }) {
  return (
    <main className="relative h-full w-full overflow-hidden">
      <Wallpaper />
      <MenuBar />
      <DeskFolders />
      <Welcome />
      <DeskClock />
      <WindowLayer />
      <Dock />
      <BootScreen />
      {children}
    </main>
  )
}
