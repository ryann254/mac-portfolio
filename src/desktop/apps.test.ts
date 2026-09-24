import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { apps, offsiteApps, siteApps } from './apps'

describe('the app registry', () => {
  /**
   * Phase 2 shipped a renamed icon and left a hole in the Contact window for a
   * round. A path in this list is a file on disk or the build is wrong.
   */
  it('points every app at an icon that exists', () => {
    const missing = apps.map((app) => join('public', app.icon)).filter((path) => !existsSync(path))
    expect(missing).toEqual([])
  })

  it('gives every app its own id', () => {
    expect(new Set(apps.map((app) => app.id)).size).toBe(apps.length)
  })

  it('splits into the apps that live here and the ones that leave', () => {
    expect([...siteApps, ...offsiteApps]).toHaveLength(apps.length)
    expect(offsiteApps.map((app) => app.id)).toEqual(['github', 'linkedin'])
  })

  it('sends the reader off site over https and stays relative at home', () => {
    expect(offsiteApps.every((app) => app.href?.startsWith('https://'))).toBe(true)
    expect(siteApps.every((app) => app.href === undefined || app.href.startsWith('/'))).toBe(true)
  })

  it('lists the offsite apps last, so the dock can rule them off', () => {
    const firstOffsite = apps.findIndex((app) => app.offsite)
    expect(apps.slice(firstOffsite).every((app) => app.offsite)).toBe(true)
  })
})
