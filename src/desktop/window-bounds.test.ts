import { describe, expect, it } from 'vitest'
import {
  type Bounds,
  clampPosition,
  handles,
  KEEP_ON_SCREEN,
  MENU_BAR,
  MIN_SIZE,
  moveBy,
  openingBounds,
  resizeBy,
  type Size,
  TITLE_BAR,
} from './window-bounds'

const screen: Size = { width: 1440, height: 900 }
const window: Bounds = { x: 400, y: 200, width: 600, height: 400 }

describe('moving a window', () => {
  it('follows the pointer by the distance it travelled', () => {
    expect(moveBy(window, 120, -60, screen)).toMatchObject({ x: 520, y: 140 })
  })

  it('leaves the size alone', () => {
    const moved = moveBy(window, 300, 300, screen)
    expect(moved.width).toBe(window.width)
    expect(moved.height).toBe(window.height)
  })

  it('never lets the title bar under the menu bar', () => {
    expect(moveBy(window, 0, -1000, screen).y).toBe(MENU_BAR)
  })

  it('never lets the title bar off the bottom', () => {
    expect(moveBy(window, 0, 1000, screen).y).toBe(screen.height - TITLE_BAR)
  })

  it('keeps a strip on screen either side, so a window can be dragged back', () => {
    expect(moveBy(window, -2000, 0, screen).x).toBe(KEEP_ON_SCREEN - window.width)
    expect(moveBy(window, 2000, 0, screen).x).toBe(screen.width - KEEP_ON_SCREEN)
  })

  it('leaves a window that is already in bounds exactly where it is', () => {
    expect(clampPosition(window, screen)).toEqual(window)
  })
})

describe('resizing a window', () => {
  it('moves the edge the reader grabbed and no other', () => {
    expect(resizeBy('e', window, 100, 999, screen)).toEqual({ ...window, width: 700 })
    expect(resizeBy('s', window, 999, 100, screen)).toEqual({ ...window, height: 500 })
  })

  it('keeps the opposite edge still when a leading edge moves', () => {
    const wider = resizeBy('w', window, -100, 0, screen)
    expect(wider).toMatchObject({ x: 300, width: 700 })
    expect(wider.x + wider.width).toBe(window.x + window.width)

    const taller = resizeBy('n', window, 0, -100, screen)
    expect(taller).toMatchObject({ y: 100, height: 500 })
    expect(taller.y + taller.height).toBe(window.y + window.height)
  })

  it('moves both edges of a corner', () => {
    expect(resizeBy('se', window, 50, 70, screen)).toEqual({
      ...window,
      width: 650,
      height: 470,
    })
    expect(resizeBy('nw', window, -50, -70, screen)).toEqual({
      x: 350,
      y: 130,
      width: 650,
      height: 470,
    })
  })

  it('gives every handle its own pair of axes', () => {
    const moved = handles.map((handle) => {
      const next = resizeBy(handle, window, 40, 40, screen)
      return [handle, next.width !== window.width, next.height !== window.height] as const
    })
    expect(moved).toEqual([
      ['n', false, true],
      ['s', false, true],
      ['e', true, false],
      ['w', true, false],
      ['ne', true, true],
      ['nw', true, true],
      ['se', true, true],
      ['sw', true, true],
    ])
  })

  it('stops shrinking at a window you can still read', () => {
    const tiny = resizeBy('nw', window, 900, 900, screen)
    expect(tiny.width).toBe(MIN_SIZE.width)
    expect(tiny.height).toBe(MIN_SIZE.height)
    // The corner the reader is not holding stays put even at the floor.
    expect(tiny.x + tiny.width).toBe(window.x + window.width)
  })

  it('stops growing at the edge of the desktop', () => {
    expect(resizeBy('e', window, 5000, 0, screen).width).toBe(screen.width - window.x)
    expect(resizeBy('s', window, 0, 5000, screen).height).toBe(screen.height - window.y)
    expect(resizeBy('n', window, 0, -5000, screen).y).toBe(MENU_BAR)
    expect(resizeBy('w', window, -5000, 0, screen).x).toBe(0)
  })
})

describe('where a window opens', () => {
  const size: Size = { width: 800, height: 500 }

  it('lands the first one centred sideways and clear of the menu bar', () => {
    const first = openingBounds(size, screen, 0)
    expect(first.x).toBe((screen.width - size.width) / 2)
    expect(first.y).toBeGreaterThan(MENU_BAR)
    expect(first).toMatchObject({ width: 800, height: 500 })
  })

  it('steps each new window down and right of the one before', () => {
    const first = openingBounds(size, screen, 0)
    const second = openingBounds(size, screen, 1)
    expect(second.x).toBeGreaterThan(first.x)
    expect(second.y).toBeGreaterThan(first.y)
  })

  it('shrinks a window that is wider than the desktop it opens on', () => {
    const narrow: Size = { width: 700, height: 600 }
    const opened = openingBounds(size, narrow, 0)
    expect(opened.width).toBeLessThanOrEqual(narrow.width)
    expect(opened.height).toBeLessThanOrEqual(narrow.height - MENU_BAR)
  })
})
