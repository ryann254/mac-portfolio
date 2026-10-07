import { describe, expect, it } from 'vitest'
import { lookOf } from './colour'
import type { Rgb } from './contrast'

const BLACK: Rgb = [0, 0, 0]
const WHITE: Rgb = [255, 255, 255]

describe('lookOf', () => {
  it('puts black at the bottom and white at the top', () => {
    expect(lookOf(BLACK).lightness).toBeCloseTo(0, 1)
    expect(lookOf(WHITE).lightness).toBeCloseTo(100, 0)
  })

  it('gives a grey no colour at all, however light it is', () => {
    for (const grey of [32, 128, 200]) {
      expect(lookOf([grey, grey, grey]).chroma, String(grey)).toBeLessThan(0.5)
    }
  })

  it('agrees with the published CIELAB values for the sRGB primaries', () => {
    // sRGB red under D65 is L* 53.24, a* 80.09, b* 67.20, so C* is 104.55.
    const red = lookOf([255, 0, 0])
    expect(red.lightness).toBeCloseTo(53.24, 1)
    expect(red.chroma).toBeCloseTo(104.55, 0)

    // sRGB blue is L* 32.30, a* 79.19, b* -107.86, so C* is 133.81.
    const blue = lookOf([0, 0, 255])
    expect(blue.lightness).toBeCloseTo(32.3, 1)
    expect(blue.chroma).toBeCloseTo(133.81, 0)
  })

  it('tells a dark purple from a dark grey, which sRGB lightness does not', () => {
    // The two the Graphite wallpaper turned on: nearly the same lightness, and
    // one of them reads as a screen that is switched off.
    const purple = lookOf([0x1c, 0x05, 0x52])
    const grey = lookOf([0x16, 0x16, 0x1a])
    expect(Math.abs(purple.lightness - grey.lightness)).toBeLessThan(5)
    expect(purple.chroma).toBeGreaterThan(grey.chroma + 30)
  })
})
