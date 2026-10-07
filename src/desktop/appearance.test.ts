import { beforeEach, describe, expect, it } from 'vitest'
import {
  APPEARANCE_KEY,
  APPEARANCE_SCRIPT,
  type Appearance,
  BRIGHTNESS_PROPERTY,
  DEFAULT_APPEARANCE,
  DIMMEST,
  readAppearance,
  THEME_ATTRIBUTE,
  themeAttribute,
  WALLPAPER_ATTRIBUTE,
  wallpapers,
} from './appearance'

const stored = (held: unknown): Appearance => readAppearance(JSON.stringify(held))

describe('readAppearance', () => {
  it('gives the default when nothing has been stored', () => {
    expect(readAppearance(null)).toEqual(DEFAULT_APPEARANCE)
  })

  it('gives the default when what was stored is not even JSON', () => {
    expect(readAppearance('{theme:')).toEqual(DEFAULT_APPEARANCE)
    expect(readAppearance('"dark"')).toEqual(DEFAULT_APPEARANCE)
    expect(readAppearance('null')).toEqual(DEFAULT_APPEARANCE)
  })

  it('reads back what the store wrote', () => {
    const chosen: Appearance = { theme: 'dark', wallpaper: 'graphite', brightness: 65 }
    expect(stored(chosen)).toEqual(chosen)
  })

  it('keeps the fields it recognises and defaults the ones it does not', () => {
    expect(stored({ theme: 'twilight', wallpaper: 'tide', brightness: 80 })).toEqual({
      theme: DEFAULT_APPEARANCE.theme,
      wallpaper: 'tide',
      brightness: 80,
    })
    expect(stored({ theme: 'dark', wallpaper: 'beach' }).wallpaper).toBe(
      DEFAULT_APPEARANCE.wallpaper,
    )
  })

  it('pulls a brightness outside the slider back inside it', () => {
    expect(stored({ brightness: 400 }).brightness).toBe(100)
    expect(stored({ brightness: 0 }).brightness).toBe(DIMMEST)
    expect(stored({ brightness: 62.4 }).brightness).toBe(62)
  })

  it('defaults a brightness that is not a number at all', () => {
    expect(stored({ brightness: '80' }).brightness).toBe(DEFAULT_APPEARANCE.brightness)
    expect(stored({ brightness: Number.NaN }).brightness).toBe(DEFAULT_APPEARANCE.brightness)
  })

  it('offers a wallpaper the stylesheet has a palette for', () => {
    // The ids are what `globals.css` keys its palettes on, so a renamed one
    // would paint the first palette for every choice.
    expect(wallpapers.map((wallpaper) => wallpaper.id)).toEqual(['monterey', 'tide', 'graphite'])
  })
})

describe('themeAttribute', () => {
  it('writes nothing for the system, so the media query is still the answer', () => {
    expect(themeAttribute('system')).toBeUndefined()
  })

  it('writes the choice once there is one', () => {
    expect(themeAttribute('light')).toBe('light')
    expect(themeAttribute('dark')).toBe('dark')
  })
})

describe('the script that runs before the first paint', () => {
  const run = () => {
    // The real thing, as the layout inlines it, against this document.
    new Function(APPEARANCE_SCRIPT)()
  }

  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute(THEME_ATTRIBUTE)
    document.documentElement.removeAttribute(WALLPAPER_ATTRIBUTE)
    document.documentElement.style.removeProperty(BRIGHTNESS_PROPERTY)
  })

  it('puts last time back on the element', () => {
    localStorage.setItem(
      APPEARANCE_KEY,
      JSON.stringify({ theme: 'dark', wallpaper: 'tide', brightness: 70 }),
    )
    run()
    const root = document.documentElement
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark')
    expect(root.getAttribute(WALLPAPER_ATTRIBUTE)).toBe('tide')
    expect(root.style.getPropertyValue(BRIGHTNESS_PROPERTY)).toBe('70')
  })

  it('leaves the theme attribute off when the reader never overrode the system', () => {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ theme: 'system', wallpaper: 'tide' }))
    run()
    expect(document.documentElement.hasAttribute(THEME_ATTRIBUTE)).toBe(false)
  })

  it('writes nothing at all when nothing has been stored', () => {
    run()
    const root = document.documentElement
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false)
    expect(root.hasAttribute(WALLPAPER_ATTRIBUTE)).toBe(false)
  })

  it('says nothing and throws nothing when the storage is rubbish', () => {
    localStorage.setItem(APPEARANCE_KEY, 'not json')
    expect(run).not.toThrow()
    expect(document.documentElement.hasAttribute(WALLPAPER_ATTRIBUTE)).toBe(false)
  })
})
