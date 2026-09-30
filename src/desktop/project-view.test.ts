import { describe, expect, it } from 'vitest'
import { experience, projects } from '@/content'
import { altOf, employerOf, hostOf, shots } from './project-view'

describe('what the desktop says about a project', () => {
  it('names the company whose role the work sits under', () => {
    for (const project of projects) {
      const role = experience.find((entry) => entry.slug === project.under)
      expect(employerOf(project), project.slug).toBe(role?.company ?? 'Personal project')
    }
  })

  /**
   * `under: 'personal'` matches no role on purpose, and it is the one case where
   * a missing role is an answer rather than a mistake.
   */
  it('credits nobody for the ones he built himself', () => {
    expect(employerOf({ ...projects[0], under: 'personal' })).toBe('Personal project')
  })

  it('shows the site itself in the address bar, without the scheme', () => {
    for (const project of projects) {
      expect(hostOf(project), project.slug).toBe(new URL(project.url).host)
      expect(hostOf(project), project.slug).not.toContain('/')
    }
  })

  it('has one picture per project, in the order the content lists them', () => {
    expect(shots.map((shot) => shot.slug)).toEqual(projects.map((project) => project.slug))
    for (const [at, shot] of shots.entries()) {
      const project = projects[at]
      expect(shot.src, shot.slug).toBe(project.thumbnail)
      expect(shot.alt, shot.slug).toBe(altOf(project))
      expect(shot.note, shot.slug).toBe(project.thumbnailNote)
    }
  })

  it('describes a picture rather than repeating the name beside it', () => {
    for (const shot of shots) {
      expect(shot.alt, shot.slug).not.toBe(shot.name)
      expect(shot.alt, shot.slug).toContain(shot.name)
    }
  })
})
