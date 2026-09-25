/**
 * The shape of everything the desktop shows. Finder derives its file tree from
 * these, so a field added here appears in the UI without a branch anywhere.
 */

/** An ISO year and month, as `YYYY-MM`. */
export type YearMonth = `${number}-${number}`

export type Link = {
  readonly label: string
  readonly href: string
}

export type SkillGroup = {
  readonly name: string
  readonly skills: readonly string[]
}

export type Achievement = {
  readonly title: string
  readonly detail: string
}

export type Profile = {
  readonly name: string
  readonly headline: string
  /** The one line under the headline on the desktop. Ryan's own words. */
  readonly tagline: string
  readonly summary: readonly string[]
  readonly location: string
  readonly email: string
  readonly links: readonly Link[]
  readonly skillGroups: readonly SkillGroup[]
  readonly achievements: readonly Achievement[]
  readonly education: readonly { readonly award: string; readonly school: string }[]
  readonly certifications: readonly string[]
}

export type Role = {
  /** Stable id, used as the Finder filename and the route segment. */
  readonly slug: string
  readonly company: string
  readonly title: string
  readonly start: YearMonth
  /** Absent means this is the current role. */
  readonly end?: YearMonth
  readonly location: string
  readonly arrangement: 'remote' | 'hybrid' | 'on-site'
  readonly bullets: readonly string[]
}

export type Project = {
  readonly slug: string
  readonly name: string
  readonly url: string
  readonly tagline: string
  /** What Ryan did, in his own voice. */
  readonly contribution: readonly string[]
  /** The role slug this work belongs to, or `personal`. */
  readonly under: string
  readonly period: string
  readonly stack: readonly string[]
  readonly thumbnail: `/projects/${string}`
  readonly thumbnailNote: string
}
