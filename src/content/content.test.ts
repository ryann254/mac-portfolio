import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { experience } from './experience'
import { profile } from './profile'
import { projects } from './projects'

const monthsSince2000 = (ym: string): number => {
  const [year, month] = ym.split('-').map(Number)
  return (year - 2000) * 12 + month
}

describe('profile', () => {
  it('leads with the role Ryan is looking for', () => {
    expect(profile.headline).toBe('Senior Frontend Engineer')
  })

  it('reaches the reader in the first person', () => {
    expect(profile.summary[0]).toMatch(/\bI\b|\bI'm\b/)
  })

  it('keeps the numbers from the CV', () => {
    const summary = profile.summary.join(' ')
    for (const figure of ['29%', '44%', '25%', '20%', '5,000']) {
      expect(summary).toContain(figure)
    }
  })

  it('offers a way to reach him', () => {
    expect(profile.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
    expect(profile.links.length).toBeGreaterThan(0)
    for (const link of profile.links) expect(link.href).toMatch(/^https:\/\//)
  })

  it('groups every skill under a named heading', () => {
    expect(profile.skillGroups.length).toBeGreaterThan(0)
    for (const group of profile.skillGroups) {
      expect(group.name).not.toHaveLength(0)
      expect(group.skills.length).toBeGreaterThan(0)
    }
  })
})

describe('experience', () => {
  it('covers every role on the CV', () => {
    expect(experience).toHaveLength(8)
  })

  it('runs newest first', () => {
    const starts = experience.map((role) => monthsSince2000(role.start))
    expect(starts).toEqual([...starts].sort((a, b) => b - a))
  })

  it('has exactly one role still running', () => {
    expect(experience.filter((role) => role.end === undefined)).toHaveLength(1)
  })

  it('never ends a role before it started', () => {
    for (const role of experience) {
      if (!role.end) continue
      expect(monthsSince2000(role.end)).toBeGreaterThan(monthsSince2000(role.start))
    }
  })

  it('gives every role a unique slug and something to say', () => {
    const slugs = experience.map((role) => role.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const role of experience) {
      expect(role.slug).toMatch(/^[a-z0-9-]+$/)
      expect(role.company).not.toHaveLength(0)
      expect(role.bullets.length).toBeGreaterThan(0)
    }
  })
})

describe('projects', () => {
  it('shows the five Ryan asked for', () => {
    expect(projects.map((project) => project.slug)).toEqual([
      'streamlyne',
      'kazinbudget',
      'surveva',
      'newline',
      'the-players-lounge',
    ])
  })

  it('links out over https', () => {
    for (const project of projects) expect(project.url).toMatch(/^https:\/\//)
  })

  it('has a thumbnail that is actually on disk', () => {
    for (const project of projects) {
      expect(existsSync(`public${project.thumbnail}`), `${project.slug} thumbnail`).toBe(true)
    }
  })

  it('says what it was built with', () => {
    for (const project of projects) expect(project.stack.length).toBeGreaterThan(0)
  })

  it('ties each project to a real role, or marks it personal', () => {
    const slugs = new Set(experience.map((role) => role.slug))
    for (const project of projects) {
      expect(slugs.has(project.under) || project.under === 'personal').toBe(true)
    }
  })

  it('says what Ryan did, in his own voice', () => {
    for (const project of projects) {
      expect(project.contribution.length).toBeGreaterThan(0)
      expect(project.contribution.join(' ')).toMatch(/\b(I|I'm|My|my|me)\b/)
    }
  })
})

describe('the site is not an application to one employer', () => {
  it('never mentions the company the source CV was aimed at', () => {
    const everything = JSON.stringify({ profile, experience, projects })
    expect(everything).not.toMatch(/moniepoint/i)
  })
})
