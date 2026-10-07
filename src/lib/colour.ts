import type { Rgb } from './contrast'

/**
 * A colour in the two terms that say whether a reader can see it: how light it
 * is and how much colour it carries. CIELAB, because the sRGB numbers do not
 * say either. `#1c0552` and `#16161a` have almost the same lightness and one
 * reads as a dark purple while the other reads as a screen that is switched
 * off, and chroma is the whole of the difference.
 */
export type Look = {
  /** CIELAB L*, from 0 at black to 100 at white. */
  readonly lightness: number
  /** CIELAB C*, which is 0 for every grey and climbs with colour. */
  readonly chroma: number
}

const linear = (value: number): number => {
  const v = value / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

const curve = (t: number): number => (t > 0.008856 ? t ** (1 / 3) : 7.787 * t + 16 / 116)

/** D65, which is what sRGB is measured against. */
export function lookOf([red, green, blue]: Rgb): Look {
  const [r, g, b] = [linear(red), linear(green), linear(blue)]
  const x = curve((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.9505)
  const y = curve(0.2126 * r + 0.7152 * g + 0.0722 * b)
  const z = curve((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.089)
  return {
    lightness: 116 * y - 16,
    chroma: Math.hypot(500 * (x - y), 200 * (y - z)),
  }
}
