import { experience, profile } from '@/content'
import type { YearMonth } from '@/content/types'

/**
 * What Terminal has already printed. A static transcript: a card about Ryan,
 * then the skills, then a prompt with nothing typed at it. Phase 10 turns the
 * prompt into a real one if there is room for it.
 *
 * Every line comes out of `src/content`, so the skills a reader sees here and
 * the skills in `skills.txt` are the same list read twice.
 */
export type Row = {
  readonly key: string
  readonly value: string
}

export type Transcript = {
  /** The card at the top, the way `neofetch` prints one. */
  readonly card: readonly Row[]
  /** What was typed to print the rest. */
  readonly typed: string
  readonly skills: readonly Row[]
}

/** The month a career started, which is the earliest month anyone hired him. */
const firstMonth = (): YearMonth =>
  experience.reduce((first, role) => (role.start < first ? role.start : first), experience[0].start)

/** Whole years between a month and a day, rounded down the way a CV rounds it. */
const yearsSince = (start: YearMonth, today: Date): number => {
  const [year, month] = start.split('-').map(Number)
  const months = (today.getUTCFullYear() - year) * 12 + (today.getUTCMonth() + 1 - month)
  return Math.floor(months / 12)
}

export const transcript = (today: Date): Transcript => {
  const current = experience.find((role) => role.end === undefined)

  return {
    card: [
      { key: 'Role', value: profile.headline },
      { key: 'Based', value: profile.location },
      { key: 'Years', value: String(yearsSince(firstMonth(), today)) },
      ...(current ? [{ key: 'Now', value: `${current.title}, ${current.company}` }] : []),
      { key: 'Email', value: profile.email },
    ],
    typed: 'cat skills.txt',
    skills: profile.skillGroups.map((group) => ({
      key: group.name,
      value: group.skills.join(', '),
    })),
  }
}
