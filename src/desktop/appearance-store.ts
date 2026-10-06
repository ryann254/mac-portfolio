'use client'

import { create } from 'zustand'
import {
  APPEARANCE_KEY,
  type Appearance,
  BRIGHTNESS_PROPERTY,
  DEFAULT_APPEARANCE,
  readAppearance,
  THEME_ATTRIBUTE,
  type Theme,
  themeAttribute,
  WALLPAPER_ATTRIBUTE,
  type WallpaperId,
} from './appearance'

/**
 * What the reader chose, and the only thing that writes it to the page after
 * the first paint. The script in the layout is the only thing that writes it
 * before, and both get the key and the attribute names from `appearance.ts`,
 * so there is no second spelling of either.
 */
export type AppearanceStore = Appearance & {
  readonly setTheme: (theme: Theme) => void
  readonly setWallpaper: (wallpaper: WallpaperId) => void
  readonly setBrightness: (brightness: number) => void
}

/**
 * The element and the storage change together or not at all, so no setter can
 * repaint the desktop and forget to remember it, or the other way round.
 */
function applied(appearance: Appearance): Appearance {
  const root = document.documentElement
  const theme = themeAttribute(appearance.theme)
  if (theme === undefined) root.removeAttribute(THEME_ATTRIBUTE)
  else root.setAttribute(THEME_ATTRIBUTE, theme)
  root.setAttribute(WALLPAPER_ATTRIBUTE, appearance.wallpaper)
  root.style.setProperty(BRIGHTNESS_PROPERTY, String(appearance.brightness))
  try {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify(appearance))
  } catch {
    // Storage is blocked, so the choice holds for this page and no longer.
  }
  return appearance
}

/**
 * Read once, on the server as well, where there is no storage and the defaults
 * are the answer. Nothing rendered depends on this: the attributes are already
 * on the element and the palettes are in CSS, so the server and the browser
 * agree on the markup whatever the reader chose.
 */
function stored(): Appearance {
  try {
    return readAppearance(globalThis.localStorage?.getItem(APPEARANCE_KEY) ?? null)
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export const useAppearance = create<AppearanceStore>((set) => ({
  ...stored(),
  setTheme: (theme) => set((was) => applied({ ...was, theme })),
  setWallpaper: (wallpaper) => set((was) => applied({ ...was, wallpaper })),
  setBrightness: (brightness) => set((was) => applied({ ...was, brightness })),
}))
