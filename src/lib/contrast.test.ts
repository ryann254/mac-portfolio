import { describe, expect, it } from 'vitest'
import { contrastRatio, type Rgb, requiredRatio } from './contrast'

const WHITE: Rgb = [255, 255, 255]
const BLACK: Rgb = [0, 0, 0]

describe('contrastRatio', () => {
  it('gives 21 for black on white, the maximum', () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 1)
  })

  it('gives 1 for a colour against itself', () => {
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 5)
  })

  it('does not care which colour is the foreground', () => {
    const sky: Rgb = [0x41, 0x80, 0xd4]
    expect(contrastRatio(sky, WHITE)).toBeCloseTo(contrastRatio(WHITE, sky), 5)
  })

  it('agrees with a known WCAG value', () => {
    // #767676 on white is the canonical 4.54:1 boundary case for body text.
    expect(contrastRatio([0x76, 0x76, 0x76], WHITE)).toBeCloseTo(4.54, 1)
  })

  it('rates the unscrimmed sky as too weak for body text', () => {
    expect(contrastRatio([0x41, 0x80, 0xd4], WHITE)).toBeLessThan(requiredRatio(false))
  })
})

describe('requiredRatio', () => {
  it('asks less of large text', () => {
    expect(requiredRatio(true)).toBe(3)
    expect(requiredRatio(false)).toBe(4.5)
  })
})
