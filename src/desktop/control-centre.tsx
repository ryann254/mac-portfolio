'use client'

import { DIMMEST, type Theme, type Wallpaper, wallpapers } from './appearance'
import { useAppearance } from './appearance-store'

/**
 * The three things a reader can change about how the desktop looks, in a sheet
 * under the menu bar icon. `appearance-store.ts` writes each one to `<html>`
 * and to local storage together, so everything here is a plain button.
 *
 * macOS keeps the appearance switch in System Settings and only the toggle in
 * Control Centre. This has all three because there is no System Settings to
 * open, and three because a toggle a reader cannot put back is worse than a row
 * of three that says which one they are on.
 */
const THEMES: readonly { readonly id: Theme; readonly label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'Auto' },
]

export function ControlCentre() {
  const { theme, wallpaper, brightness, setTheme, setWallpaper, setBrightness } = useAppearance()

  return (
    <section
      aria-label="Control Centre"
      data-testid="control-centre"
      className="pointer-events-auto absolute top-8 right-2 w-[272px] space-y-4 rounded-2xl border-[0.5px] border-black/15 bg-white/70 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-2xl backdrop-saturate-150 motion-safe:animate-[panel-in_140ms_ease-out] dark:border-white/15 dark:bg-zinc-800/70"
    >
      <Group label="Appearance">
        <div className="flex gap-1.5">
          {THEMES.map((option) => (
            <button
              key={option.id}
              type="button"
              data-theme-choice={option.id}
              aria-pressed={theme === option.id}
              onClick={() => setTheme(option.id)}
              className={`flex-1 rounded-lg px-2 py-1.5 text-[12.5px] focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 ${
                theme === option.id
                  ? 'bg-sky-600 font-medium text-white'
                  : 'bg-black/5 text-zinc-800 dark:bg-white/10 dark:text-zinc-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </Group>

      <Group label="Brightness">
        <input
          type="range"
          min={DIMMEST}
          max={100}
          step={5}
          value={brightness}
          onChange={(event) => setBrightness(Number(event.target.value))}
          aria-label="Brightness"
          className="w-full accent-sky-600"
        />
      </Group>

      <Group label="Wallpaper">
        <div className="flex gap-2">
          {wallpapers.map((choice) => (
            <Tile
              key={choice.id}
              choice={choice}
              chosen={wallpaper === choice.id}
              onPress={() => setWallpaper(choice.id)}
            />
          ))}
        </div>
      </Group>
    </section>
  )
}

const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <p className="font-medium text-[11px] text-zinc-600 uppercase tracking-wide dark:text-zinc-400">
      {label}
    </p>
    {children}
  </div>
)

/**
 * The swatch is three of that wallpaper's own colours, so it is the real
 * palette in the current theme rather than a picture to keep in step with one.
 * The attribute does it: every palette in `globals.css` matches on
 * `[data-wallpaper]` alone and not on `:root`.
 */
const Tile = ({
  choice,
  chosen,
  onPress,
}: {
  choice: Wallpaper
  chosen: boolean
  onPress: () => void
}) => (
  <button
    type="button"
    data-wallpaper-choice={choice.id}
    aria-pressed={chosen}
    onClick={onPress}
    className="flex-1 space-y-1.5 rounded-lg focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
  >
    <span
      data-wallpaper={choice.id}
      className={`block h-11 w-full rounded-lg border bg-[linear-gradient(to_top_right,var(--wall-ridge-1),var(--wall-base-2)_55%,var(--wall-right-1))] ${
        chosen ? 'border-sky-600 ring-2 ring-sky-600/60' : 'border-black/15 dark:border-white/20'
      }`}
    />
    <span className="block text-center text-[11.5px] text-zinc-800 dark:text-zinc-200">
      {choice.name}
    </span>
  </button>
)
