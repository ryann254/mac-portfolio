import { BootScreen } from '@/desktop/boot-screen'
import { DeskClock } from '@/desktop/desk-clock'
import { DeskFolders } from '@/desktop/desk-folders'
import { Dock } from '@/desktop/dock'
import { MenuBar } from '@/desktop/menu-bar'
import { Wallpaper } from '@/desktop/wallpaper'
import { Welcome } from '@/desktop/welcome'
import { WindowLayer } from '@/desktop/window-layer'

export default function Home() {
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
    </main>
  )
}
