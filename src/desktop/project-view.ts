import { experience, projects } from '@/content'
import type { Project } from '@/content/types'

/**
 * The three things about a project that no content file writes down: who it was
 * built for, where it lives, and the picture of it. Finder's readme, Safari, and
 * Photos all say them, so they are said once here rather than three times.
 */

/** Where a project was built: the company whose role it sits under, or nobody's. */
export const employerOf = (project: Project): string =>
  experience.find((role) => role.slug === project.under)?.company ?? 'Personal project'

/** What Safari's address bar shows, which is the site itself and not the scheme. */
export const hostOf = (project: Project): string => new URL(project.url).host

/** What a screen reader hears in place of the screenshot. */
export const altOf = (project: Project): string => `The ${project.name} homepage`

export type Shot = {
  readonly slug: string
  readonly name: string
  readonly src: string
  readonly alt: string
  /** Where the picture came from, which is the caption under an enlarged one. */
  readonly note: string
}

/** The five screenshots, which are the gallery in Photos and the hero in Safari. */
export const shots: readonly Shot[] = projects.map((project) => ({
  slug: project.slug,
  name: project.name,
  src: project.thumbnail,
  alt: altOf(project),
  note: project.thumbnailNote,
}))
