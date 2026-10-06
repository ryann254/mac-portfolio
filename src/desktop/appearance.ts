/**
 * The three things a reader can change about how the desktop looks, and the one
 * place that says how each one reaches the page.
 *
 * CSS does the work. `globals.css` holds a light and a dark half for every
 * colour in every wallpaper, keyed on two attributes on `<html>`, so this file
 * writes three values and draws nothing itself. That is also what lets the
 * script in the layout set them before the first paint, where there is no React
 * yet, and what makes a value it does not recognise fall back rather than break.
 */

export type Theme = 'light' | 'dark' | 'system'

export type WallpaperId = 'monterey' | 'tide' | 'graphite'

export type Wallpaper = {
  readonly id: WallpaperId
  readonly name: string
}

/** The three on offer, in the order Control Centre shows them. */
export const wallpapers: readonly Wallpaper[] = [
  { id: 'monterey', name: 'Monterey' },
  { id: 'tide', name: 'Tide' },
  { id: 'graphite', name: 'Graphite' },
]

export type Appearance = {
  readonly theme: Theme
  readonly wallpaper: WallpaperId
  /** As a percentage. 100 is the wallpaper as drawn. */
  readonly brightness: number
}

/**
 * Dark mode follows the system and the wallpaper is the one the mockup was
 * approved with, so a reader who never opens Control Centre gets the site as
 * phase 2 settled it.
 */
export const DEFAULT_APPEARANCE: Appearance = {
  theme: 'system',
  wallpaper: 'monterey',
  brightness: 100,
}

/** How far down the brightness goes. A screen that reaches black is a broken screen. */
export const DIMMEST = 40

export const APPEARANCE_KEY = 'mac-portfolio-appearance'

export const THEME_ATTRIBUTE = 'data-theme'
export const WALLPAPER_ATTRIBUTE = 'data-wallpaper'
export const BRIGHTNESS_PROPERTY = '--brightness'

const themes: readonly Theme[] = ['light', 'dark', 'system']

/**
 * `data-theme` goes on the element only when the reader has overridden the
 * system. Without it every `dark:` class and every wallpaper colour reads
 * `prefers-color-scheme`, so a browser with JavaScript off still gets the dark
 * desktop its owner asked the operating system for.
 */
export const themeAttribute = (theme: Theme): string | undefined =>
  theme === 'system' ? undefined : theme

const clamp = (value: number): number => Math.min(100, Math.max(DIMMEST, Math.round(value)))

/**
 * What was stored last time. It is whatever an older version of this site wrote
 * and whatever a reader has since typed into their own devtools, so every field
 * is checked on the way in and a bad one falls back to the default instead of
 * throwing in the middle of the first render.
 */
export function readAppearance(stored: string | null): Appearance {
  if (stored === null) return DEFAULT_APPEARANCE
  let held: unknown
  try {
    held = JSON.parse(stored)
  } catch {
    return DEFAULT_APPEARANCE
  }
  if (typeof held !== 'object' || held === null) return DEFAULT_APPEARANCE
  const { theme, wallpaper, brightness } = held as Partial<Record<keyof Appearance, unknown>>
  return {
    theme: themes.find((known) => known === theme) ?? DEFAULT_APPEARANCE.theme,
    wallpaper:
      wallpapers.find((known) => known.id === wallpaper)?.id ?? DEFAULT_APPEARANCE.wallpaper,
    brightness:
      typeof brightness === 'number' && Number.isFinite(brightness)
        ? clamp(brightness)
        : DEFAULT_APPEARANCE.brightness,
  }
}

/**
 * Runs before the first paint, so a reader who chose dark or a different
 * wallpaper does not watch the default one repaint. It is deliberately dumber
 * than `readAppearance`: CSS carries the default palette and clamps the
 * brightness it is handed, so the worst a value this does not recognise can do
 * is leave the desktop looking the way it looks for everybody else. The store
 * reads the same key properly a moment later and writes it back.
 */
export const APPEARANCE_SCRIPT = `try{var a=JSON.parse(localStorage.getItem(${JSON.stringify(APPEARANCE_KEY)})||'{}'),d=document.documentElement;if(a.theme==='dark'||a.theme==='light')d.setAttribute(${JSON.stringify(THEME_ATTRIBUTE)},a.theme);if(a.wallpaper)d.setAttribute(${JSON.stringify(WALLPAPER_ATTRIBUTE)},a.wallpaper);if(a.brightness)d.style.setProperty(${JSON.stringify(BRIGHTNESS_PROPERTY)},a.brightness+'')}catch(e){}`
