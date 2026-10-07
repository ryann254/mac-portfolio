import { describe, expect, it } from 'vitest'
import { experience } from '@/content'
import { hueOf, initialsOf } from './lettermark'

describe('initialsOf', () => {
  it('takes the capitals a company already writes its name with', () => {
    expect(initialsOf('Riyadh Real Estate')).toBe('RRE')
    expect(initialsOf('SoftsearchLab')).toBe('SL')
    expect(initialsOf('MajiSoft Innovations')).toBe('MSI')
  })

  it('stops at three, because four is a word set too small to read', () => {
    expect(initialsOf('One Two Three Four Five')).toHaveLength(3)
  })

  it('falls back to the first letter when a name has no other capital', () => {
    expect(initialsOf('Park254')).toBe('P')
    expect(initialsOf('acme')).toBe('A')
  })

  it('gives every role on the CV something to wear', () => {
    for (const role of experience) {
      expect(initialsOf(role.company).length, role.company).toBeGreaterThan(0)
    }
  })
})

describe('hueOf', () => {
  it('gives a company the same colour every time', () => {
    expect(hueOf('Park254')).toBe(hueOf('Park254'))
  })

  it('stays on the wheel', () => {
    for (const role of experience) {
      const hue = hueOf(role.company)
      expect(hue, role.company).toBeGreaterThanOrEqual(0)
      expect(hue, role.company).toBeLessThan(360)
    }
  })

  it('keeps the companies without a logo apart from each other', () => {
    const hues = experience
      .filter((role) => role.logo === undefined)
      .map((role) => hueOf(role.company))
    expect(new Set(hues).size).toBe(hues.length)
  })
})
