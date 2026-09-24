/**
 * How the two clocks read the time. Hand-rolled rather than `Intl`, because the
 * menu bar's order is "Tue 23 Sep", which no locale produces, and because the
 * flip clock needs the four digits on their own.
 *
 * Both clocks call these with the same `Date`, so they cannot disagree.
 */
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

const pad = (value: number): string => String(value).padStart(2, '0')

/** Hours and minutes on a twelve hour clock, both padded. Midnight is 12. */
export function twelveHour(at: Date): { hours: string; minutes: string; suffix: 'AM' | 'PM' } {
  return {
    hours: pad(at.getHours() % 12 || 12),
    minutes: pad(at.getMinutes()),
    suffix: at.getHours() < 12 ? 'AM' : 'PM',
  }
}

/** "Tue 23 Sep 6:41 PM", the way the menu bar shows it. */
export function menuBarTime(at: Date): string {
  const { hours, minutes, suffix } = twelveHour(at)
  const day = `${DAYS[at.getDay()]} ${at.getDate()} ${MONTHS[at.getMonth()]}`
  return `${day} ${hours.replace(/^0/, '')}:${minutes} ${suffix}`
}

/** "TUE · SEP 23", the line over the flip clock. */
export const flipDate = (at: Date): string =>
  `${DAYS[at.getDay()]} · ${MONTHS[at.getMonth()]} ${at.getDate()}`.toUpperCase()

/** The four digits on the flip cards, most significant first. */
export const flipDigits = (at: Date): readonly string[] => {
  const { hours, minutes } = twelveHour(at)
  return [...hours, ...minutes]
}
