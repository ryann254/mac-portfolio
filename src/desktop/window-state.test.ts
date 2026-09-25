import { describe, expect, it } from 'vitest'
import type { AppId } from './apps'
import type { Size } from './window-bounds'
import {
  close,
  type Desktop,
  find,
  focus,
  focused,
  isOpen,
  minimize,
  open,
  place,
  toggleMaximized,
} from './window-state'

const screen: Size = { width: 1440, height: 900 }
const size: Size = { width: 600, height: 400 }

const openAll = (...ids: readonly AppId[]): Desktop =>
  ids.reduce<Desktop>((desktop, id) => open(desktop, id, size, screen), [])

const order = (desktop: Desktop): readonly AppId[] => desktop.map((entry) => entry.id)

describe('opening a window', () => {
  it('puts the new window in front', () => {
    const desktop = openAll('finder', 'safari')
    expect(order(desktop)).toEqual(['finder', 'safari'])
    expect(focused(desktop)).toBe('safari')
  })

  it('gives it a rectangle on the desktop', () => {
    const [window] = openAll('finder')
    expect(window.bounds).toMatchObject({ width: 600, height: 400 })
    expect(window.minimized).toBe(false)
    expect(window.maximized).toBe(false)
  })

  it('focuses the one already up instead of opening a second', () => {
    const desktop = open(openAll('finder', 'safari'), 'finder', size, screen)
    expect(order(desktop)).toEqual(['safari', 'finder'])
    expect(focused(desktop)).toBe('finder')
  })

  it('brings a minimised window back from the dock', () => {
    const desktop = open(minimize(openAll('finder'), 'finder'), 'finder', size, screen)
    expect(find(desktop, 'finder')?.minimized).toBe(false)
    expect(focused(desktop)).toBe('finder')
  })

  it('opens nothing on an empty desktop until it is asked to', () => {
    expect(isOpen([], 'finder')).toBe(false)
    expect(focused([])).toBeUndefined()
  })
})

describe('focus', () => {
  it('raises a window that was behind', () => {
    const desktop = focus(openAll('finder', 'safari', 'terminal'), 'finder')
    expect(order(desktop)).toEqual(['safari', 'terminal', 'finder'])
    expect(focused(desktop)).toBe('finder')
  })

  it('leaves the stack alone when the window is not open', () => {
    const desktop = openAll('finder', 'safari')
    expect(focus(desktop, 'photos')).toBe(desktop)
  })

  it('leaves the stack alone when the window is already in front', () => {
    const desktop = openAll('finder', 'safari')
    expect(focus(desktop, 'safari')).toBe(desktop)
  })
})

describe('closing a window', () => {
  it('hands the focus to whatever was under it', () => {
    const desktop = close(openAll('finder', 'safari'), 'safari')
    expect(order(desktop)).toEqual(['finder'])
    expect(focused(desktop)).toBe('finder')
  })

  it('leaves the others in the order they were in', () => {
    const desktop = close(openAll('finder', 'safari', 'terminal'), 'safari')
    expect(order(desktop)).toEqual(['finder', 'terminal'])
  })
})

describe('minimising a window', () => {
  it('keeps the position and the size it had', () => {
    const before = place(openAll('finder'), 'finder', { x: 12, y: 34, width: 500, height: 300 })
    const after = minimize(before, 'finder')
    expect(find(after, 'finder')?.bounds).toEqual(find(before, 'finder')?.bounds)
  })

  it('hands the focus down without leaving the stack', () => {
    const desktop = minimize(openAll('finder', 'safari'), 'safari')
    expect(isOpen(desktop, 'safari')).toBe(true)
    expect(focused(desktop)).toBe('finder')
  })

  it('leaves nothing focused when the last window goes down', () => {
    expect(focused(minimize(openAll('finder'), 'finder'))).toBeUndefined()
  })
})

describe('maximising a window', () => {
  it('round-trips, because the rectangle it had is never overwritten', () => {
    const up = openAll('finder')
    const big = toggleMaximized(up, 'finder')
    expect(find(big, 'finder')?.maximized).toBe(true)
    const back = toggleMaximized(big, 'finder')
    expect(find(back, 'finder')).toEqual(find(up, 'finder'))
  })

  it('brings the window to the front on the way', () => {
    const desktop = toggleMaximized(openAll('finder', 'safari'), 'finder')
    expect(focused(desktop)).toBe('finder')
  })
})

describe('placing a window', () => {
  it('stores where a drag or a resize left it', () => {
    const bounds = { x: 20, y: 40, width: 700, height: 420 }
    expect(find(place(openAll('finder'), 'finder', bounds), 'finder')?.bounds).toEqual(bounds)
  })

  it('touches no other window', () => {
    const before = openAll('finder', 'safari')
    const after = place(before, 'finder', { x: 0, y: 28, width: 400, height: 300 })
    expect(find(after, 'safari')).toEqual(find(before, 'safari'))
  })
})
