import { describe, expect, it } from 'vitest'
import { panelAfter } from './panels'

describe('panelAfter', () => {
  it('opens the one asked for when nothing is up', () => {
    expect(panelAfter(undefined, 'launchpad')).toBe('launchpad')
  })

  it('closes the one already up when its own control is pressed again', () => {
    expect(panelAfter('control-centre', 'control-centre')).toBeUndefined()
  })

  it('swaps one for another, so only ever one is up', () => {
    expect(panelAfter('apple', 'about')).toBe('about')
  })
})
