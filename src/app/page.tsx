import { Wallpaper } from '@/desktop/wallpaper'
import { Welcome } from '@/desktop/welcome'

export default function Home() {
  return (
    <main className="relative h-full w-full">
      <Wallpaper />
      <Welcome />
    </main>
  )
}
