import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { addressedApps, apps, dockApps, fileApps, offsiteApps, windowedApps } from './apps'
import { MIN_SIZE } from './window-bounds'

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

  it('sorts every app into one of the three ways a reader reaches it', () => {
    expect([...dockApps, ...offsiteApps, ...fileApps]).toHaveLength(apps.length)
    expect(offsiteApps.map((app) => app.id)).toEqual(['github', 'linkedin'])
    expect(fileApps.map((app) => app.id)).toEqual(['text', 'image'])
  })

  it('sends the reader off site over https and stays relative at home', () => {
    expect(offsiteApps.every((app) => app.href?.startsWith('https://'))).toBe(true)
    expect([...dockApps, ...fileApps].every((app) => app.href === undefined)).toBe(true)
  })

  it('gives an address to every app in the dock, except the Launchpad overlay', () => {
    expect(addressedApps.map((app) => app.id)).toEqual(
      dockApps.filter((app) => app.id !== 'launchpad').map((app) => app.id),
    )
  })

  /**
   * A dock icon and a bare address both name no file, so an app that needs one
   * can have neither. Finder is the only way into these two.
   */
  it('opens a window for the apps Finder opens on a file, and gives them no address', () => {
    expect(fileApps.every((app) => app.window !== undefined)).toBe(true)
    expect(windowedApps.filter((app) => !addressedApps.includes(app)).map((app) => app.id)).toEqual(
      fileApps.map((app) => app.id),
    )
  })

  it('never opens a window smaller than one a reader can resize', () => {
    const cramped = windowedApps.filter(
      (app) => app.window.width < MIN_SIZE.width || app.window.height < MIN_SIZE.height,
    )
    expect(cramped).toEqual([])
  })

  it('lists the offsite apps last, so the dock can rule them off', () => {
    const firstOffsite = apps.findIndex((app) => app.reach === 'offsite')
    expect(apps.slice(firstOffsite).every((app) => app.reach === 'offsite')).toBe(true)
  })
})
