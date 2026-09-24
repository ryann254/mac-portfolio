import { describe, expect, it } from 'vitest'
import { flipDate, flipDigits, menuBarTime, twelveHour } from './clock'

const at = (iso: string) => new Date(iso)

describe('reading the clock', () => {
  it('shows a twelve hour clock with midnight as twelve', () => {
    expect(twelveHour(at('2026-09-24T00:07:00'))).toEqual({
      hours: '12',
      minutes: '07',
      suffix: 'AM',
    })
    expect(twelveHour(at('2026-09-24T12:00:00'))).toEqual({
      hours: '12',
      minutes: '00',
      suffix: 'PM',
    })
    expect(twelveHour(at('2026-09-24T18:41:00'))).toEqual({
      hours: '06',
      minutes: '41',
      suffix: 'PM',
    })
  })

  it('writes the menu bar line the way macOS does', () => {
    expect(menuBarTime(at('2026-09-24T18:41:00'))).toBe('Thu 24 Sep 6:41 PM')
    expect(menuBarTime(at('2026-01-05T09:05:00'))).toBe('Mon 5 Jan 9:05 AM')
  })

  it('writes the date over the flip clock in capitals', () => {
    expect(flipDate(at('2026-09-24T18:41:00'))).toBe('THU · SEP 24')
  })

  it('splits the time into four cards', () => {
    expect(flipDigits(at('2026-09-24T18:41:00'))).toEqual(['0', '6', '4', '1'])
    expect(flipDigits(at('2026-09-24T00:07:00'))).toEqual(['1', '2', '0', '7'])
  })

  it('gives both clocks the same minute from one date', () => {
    const now = at('2026-09-24T23:59:00')
    expect(menuBarTime(now)).toContain('11:59')
    expect(flipDigits(now).join('')).toBe('1159')
  })
})
