import { projects } from '@/content'
import type { Result } from '@/content/types'
import { employerOf, hostOf, type Shot, shots } from './project-view'

/**
 * What Safari has open. One tab per project, in the order `projects.ts` lists
 * them, and the page behind each tab is that project with nothing added: Safari
 * shows our own screenshot rather than the site in a frame, because three of the
 * five refuse to be framed, and the button goes to the real thing.
 */
export type Page = {
  readonly slug: string
  readonly name: string
  /** What the address bar shows, and what the button to leave is labelled with. */
  readonly host: string
  readonly url: string
  readonly tagline: string
  readonly contribution: readonly string[]
  readonly stack: readonly string[]
  /** What the work moved, in numbers. Empty for a project whose work has none. */
  readonly results: readonly Result[]
  readonly employer: string
  readonly period: string
  readonly shot: Shot
}

export const pages: readonly Page[] = projects.map((project, at) => ({
  slug: project.slug,
  name: project.name,
  host: hostOf(project),
  url: project.url,
  tagline: project.tagline,
  contribution: project.contribution,
  stack: project.stack,
  results: project.results,
  employer: employerOf(project),
  period: project.period,
  shot: shots[at],
}))

/**
 * The tab a window is on. A Safari window is always on a project, so a window
 * that names none is on the first, the way a browser opens on a page rather
 * than on nothing.
 */
export const pageAt = (slug: string | undefined): Page =>
  pages.find((page) => page.slug === slug) ?? pages[0]
