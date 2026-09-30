import { describe, expect, it } from 'vitest'
import { profile } from '@/content'
import { offsiteApps } from './apps'
import { rows } from './contact-rows'

describe('the ways to reach him', () => {
  it('leads with the email, as a link a mail client answers', () => {
    expect(rows[0]).toMatchObject({
      label: 'Email',
      value: profile.email,
      href: `mailto:${profile.email}`,
      kind: 'mail',
    })
  })

  it('has a row per link on the profile, in that order', () => {
    expect(rows.slice(1).map((row) => row.label)).toEqual(profile.links.map((link) => link.label))
    for (const [at, row] of rows.slice(1).entries()) {
      expect(row.href, row.label).toBe(profile.links[at].href)
      expect(row.kind, row.label).toBe('offsite')
    }
  })

  it('shows an address the way a person reads one, without the scheme', () => {
    for (const row of rows.slice(1)) {
      expect(row.value, row.label).not.toContain('://')
      expect(row.value, row.label).not.toMatch(/\/$/)
      expect(row.href, row.label).toContain(row.value)
    }
  })

  /**
   * The icon is the dock's, found by where the link goes. If a link ever
   * outruns the dock the lookup throws, so this is the test that would catch it
   * before a reader met a window with a hole in it.
   */
  it('wears the icon of the dock app that goes to the same place', () => {
    for (const link of profile.links) {
      const app = offsiteApps.find((entry) => entry.href === link.href)
      expect(app, link.href).toBeDefined()
      expect(rows.find((row) => row.href === link.href)?.icon).toBe(app?.icon)
    }
  })

  it('gives every row something to show', () => {
    for (const row of rows) {
      expect(row.icon, row.label).toMatch(/^\/icons\//)
      expect(row.value.length, row.label).toBeGreaterThan(0)
    }
  })
})
