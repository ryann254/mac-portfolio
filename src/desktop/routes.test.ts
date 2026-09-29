import { describe, expect, it } from 'vitest'
import { projects } from '@/content'
import { windowedApps } from './apps'
import { locations } from './locations'
import { NOT_FOUND, routeOf, routes, showingsOf, targetAt, windowTitle } from './routes'

const everyTarget = windowedApps.flatMap((app) => [
  { app: app.id },
  ...showingsOf(app.id).map((showing) => ({ app: app.id, showing: showing.slug })),
])

describe('the addresses and the windows', () => {
  it('reads every address back as the window it names', () => {
    for (const route of routes) {
      expect(routeOf(targetAt(route)), route).toBe(route)
    }
  })

  it('gives every window one address and finds the window again at it', () => {
    for (const target of everyTarget) {
      const route = routeOf(target)
      expect(route, `${target.app} has no address`).toBeDefined()
      expect(targetAt(route ?? '')).toEqual(target)
    }
  })

  it('has one address per window, and `/` for the desktop itself', () => {
    expect(new Set(routes).size).toBe(routes.length)
    expect(routes).toHaveLength(everyTarget.length + 1)
    expect(targetAt('/')).toBeUndefined()
    expect(routeOf(undefined)).toBe('/')
  })

  it('has one for every project and every place Finder goes', () => {
    for (const project of projects) expect(routes).toContain(`/safari/${project.slug}`)
    for (const location of locations) expect(routes).toContain(`/finder/${location.slug}`)
  })

  it('answers to nothing an app does not open a window for', () => {
    expect(targetAt('/launchpad')).toBeUndefined()
    expect(targetAt('/github')).toBeUndefined()
    expect(targetAt('/about')).toBeUndefined()
    expect(targetAt('/safari/a-project-that-left')).toBeUndefined()
    expect(targetAt('/finder/projects/deeper')).toBeUndefined()
  })

  it('leaves the address alone for the window that stands in for a miss', () => {
    expect(routeOf({ app: 'finder', showing: NOT_FOUND })).toBeUndefined()
  })
})

describe('what a title bar says', () => {
  it('is the app, until the window is on something', () => {
    expect(windowTitle({ app: 'finder' })).toBe('Finder')
    expect(windowTitle({ app: 'terminal' })).toBe('Terminal')
  })

  it('is the folder Finder is in and the project Safari is on', () => {
    expect(windowTitle({ app: 'finder', showing: 'projects' })).toBe('Projects')
    expect(windowTitle({ app: 'safari', showing: 'streamlyne' })).toBe('Streamlyne')
  })

  it('is the miss itself on the 404 window', () => {
    expect(windowTitle({ app: 'finder', showing: NOT_FOUND })).toBe('File not found')
  })
})
