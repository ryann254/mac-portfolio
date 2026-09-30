import { describe, expect, it } from 'vitest'
import { projects } from '@/content'
import { HOME } from './file-tree'
import {
  canGoBack,
  canGoForward,
  canGoUp,
  goBack,
  goForward,
  goTo,
  goUp,
  remembered,
  TRAIL_START,
  type Trail,
  trailAfter,
  trailTarget,
  where,
} from './finder-trail'
import type { Desktop } from './window-state'

const INSIDE = `projects/${projects[0].slug}`

/** The trail after walking into these folders in order, starting from home. */
const walk = (...folders: string[]): Trail => folders.reduce(goTo, TRAIL_START)

const finderAt = (showing?: string): Desktop => [
  {
    id: 'finder',
    showing,
    bounds: { x: 0, y: 0, width: 400, height: 300 },
    minimized: false,
    maximized: false,
  },
]

describe('where Finder has been', () => {
  it('starts in the folder the sidebar starts in', () => {
    expect(where(TRAIL_START)).toBe(HOME)
    expect(canGoBack(TRAIL_START)).toBe(false)
    expect(canGoForward(TRAIL_START)).toBe(false)
  })

  it('remembers each folder it is walked into', () => {
    const trail = walk('projects', INSIDE)
    expect(where(trail)).toBe(INSIDE)
    expect(trail.seen).toEqual([HOME, 'projects', INSIDE])
  })

  it('goes back and then forward over the same folders', () => {
    const trail = walk('projects', INSIDE)
    expect(where(goBack(trail))).toBe('projects')
    expect(where(goBack(goBack(trail)))).toBe(HOME)
    expect(where(goForward(goBack(trail)))).toBe(INSIDE)
  })

  it('leaves the trail alone at the beginning, at the end, and at the top', () => {
    const trail = walk('projects')
    expect(goBack(TRAIL_START)).toBe(TRAIL_START)
    expect(goForward(trail)).toBe(trail)
    expect(goUp(TRAIL_START)).toBe(TRAIL_START)
    expect(canGoUp(TRAIL_START)).toBe(false)
  })

  it('goes up out of a folder, and up is somewhere back can undo', () => {
    const trail = walk('projects', INSIDE)
    expect(canGoUp(trail)).toBe(true)
    const up = goUp(trail)
    expect(where(up)).toBe('projects')
    expect(where(goBack(up))).toBe(INSIDE)
  })

  /** A browser drops what forward was holding once you go somewhere else. */
  it('drops what forward was holding when it is walked somewhere new', () => {
    const trail = goTo(goBack(walk('projects', INSIDE)), 'skills')
    expect(trail.seen).toEqual([HOME, 'projects', 'skills'])
    expect(canGoForward(trail)).toBe(false)
  })

  it('does not put a folder in twice for standing still', () => {
    const trail = walk('projects')
    expect(goTo(trail, 'projects')).toBe(trail)
  })
})

describe('the trail and the window it belongs to', () => {
  it('records whatever folder the Finder window ends up in', () => {
    expect(where(trailAfter(TRAIL_START, finderAt('skills')))).toBe('skills')
  })

  it('stays where it was when Finder is closed, so reopening comes back', () => {
    const trail = walk('projects')
    expect(trailAfter(trail, [])).toBe(trail)
    expect(where(trailAfter(trail, finderAt(undefined)))).toBe('projects')
  })

  it('hands the window rules the folder it is pointing at', () => {
    expect(trailTarget(walk('skills'))).toEqual({ app: 'finder', showing: 'skills' })
  })

  it('fills in the folder for a dock icon, which names none', () => {
    const trail = walk('projects')
    expect(remembered({ app: 'finder' }, trail)).toEqual({ app: 'finder', showing: 'projects' })
    expect(remembered({ app: 'finder', showing: 'skills' }, trail)).toEqual({
      app: 'finder',
      showing: 'skills',
    })
    expect(remembered({ app: 'safari' }, trail)).toEqual({ app: 'safari' })
  })
})
