import { describe, expect, it } from 'vitest'
import { projects } from '@/content'
import { employerOf, hostOf, shots } from './project-view'
import { pageAt, pages } from './safari-tabs'

describe('what Safari has open', () => {
  it('has a tab per project, in the order the content lists them', () => {
    expect(pages.map((page) => page.slug)).toEqual(projects.map((project) => project.slug))
  })

  it('carries every project across without adding anything of its own', () => {
    for (const [at, page] of pages.entries()) {
      const project = projects[at]
      expect(page, page.slug).toEqual({
        slug: project.slug,
        name: project.name,
        host: hostOf(project),
        url: project.url,
        tagline: project.tagline,
        contribution: project.contribution,
        stack: project.stack,
        employer: employerOf(project),
        period: project.period,
        shot: shots[at],
      })
    }
  })

  it('leaves the site by the address the project gives, not by the host it shows', () => {
    for (const page of pages) {
      expect(page.url, page.slug).toMatch(/^https:\/\//)
      expect(page.url, page.slug).toContain(page.host)
    }
  })

  /** A Safari window is always on a project, so it opens on one either way. */
  it('is on the first project when nothing names one, and when a name is stale', () => {
    expect(pageAt(undefined)).toBe(pages[0])
    expect(pageAt('a-project-that-left')).toBe(pages[0])
    expect(pageAt(projects[2].slug)).toBe(pages[2])
  })
})
