import { describe, expect, it } from 'vitest'
import { experience, profile } from '@/content'
import { transcript } from './terminal-transcript'

/** A day the test can keep, so a year passing does not turn the run red. */
const SEPTEMBER = new Date('2026-09-30T00:00:00Z')

const value = (key: string, at: Date = SEPTEMBER): string | undefined =>
  transcript(at).card.find((row) => row.key === key)?.value

describe("Terminal's transcript", () => {
  it('reads the card out of the profile', () => {
    expect(value('Role')).toBe(profile.headline)
    expect(value('Based')).toBe(profile.location)
    expect(value('Email')).toBe(profile.email)
  })

  it('counts the years from the first month anyone hired him, rounded down', () => {
    expect(value('Years')).toBe('6')
    expect(value('Years', new Date('2026-12-31T00:00:00Z'))).toBe('6')
    expect(value('Years', new Date('2027-01-01T00:00:00Z'))).toBe('7')
  })

  it('says what he is doing now, which is the role with no end on it', () => {
    const current = experience.find((role) => role.end === undefined)
    expect(current).toBeDefined()
    expect(value('Now')).toBe(`${current?.title}, ${current?.company}`)
  })

  /** Between jobs the row would have nothing in it, so it is not printed. */
  it('leaves the row out rather than printing an empty one', () => {
    const between = transcript(SEPTEMBER).card.filter((row) => row.key === 'Now')
    expect(between).toHaveLength(experience.some((role) => role.end === undefined) ? 1 : 0)
  })

  it('prints the same skills `skills.txt` holds, group by group', () => {
    expect(transcript(SEPTEMBER).skills).toEqual(
      profile.skillGroups.map((group) => ({ key: group.name, value: group.skills.join(', ') })),
    )
  })

  it('says what was typed to print them', () => {
    expect(transcript(SEPTEMBER).typed).toBe('cat skills.txt')
  })
})
