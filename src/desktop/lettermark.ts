/**
 * The stand-in mark for a company with no logo to fetch. Four of the eight have
 * no site left, and a role with a blank where the others carry a mark reads as
 * something that failed to load, so each one gets initials on a colour of its
 * own instead.
 *
 * Both halves are derived from the company's name, so a ninth role added to the
 * CV arrives with a mark and nothing here has to be edited.
 */

/** Three letters is a monogram. More is a word set too small to read. */
const MOST = 3

/**
 * The capitals a company already writes its name with, which is what a reader
 * would shorten it to: `SoftsearchLab` is SL and `Riyadh Real Estate` is RRE.
 * A name with no capital after the first falls back to that one letter, because
 * two letters off the front of a word reads as a syllable rather than a mark.
 */
export function initialsOf(company: string): string {
  const capitals = company.match(/[A-Z]/g) ?? []
  if (capitals.length === 0) return company.slice(0, 1).toUpperCase()
  return capitals.slice(0, MOST).join('')
}

/**
 * A hue off the name, so a company keeps the same colour everywhere and two
 * companies rarely land on one. Any stable spread would do; this is the
 * smallest one that does not need a table of colours kept in step with the CV.
 */
export function hueOf(company: string): number {
  let total = 0
  for (const letter of company) total = (total * 31 + letter.charCodeAt(0)) % 360
  return total
}

/**
 * How dark the tile is. White letters sit on it, so this is the number that
 * decides whether they can be read, and `lettermark.test.ts` holds every hue to
 * 4.5:1 rather than trusting that one lightness works all the way round.
 */
export const LETTERMARK_LIGHTNESS = 0.48
export const LETTERMARK_CHROMA = 0.13

export const lettermarkColour = (hue: number): string =>
  `oklch(${LETTERMARK_LIGHTNESS} ${LETTERMARK_CHROMA} ${hue})`
