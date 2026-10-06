import { describe, expect, it } from 'vitest'
import {
  BOOTED_KEY,
  CURTAINS,
  hasBootedAlready,
  isBooting,
  next,
  rememberBoot,
  type SessionMemory,
  type SystemState,
  states,
} from './system-state'

const fakeMemory = (seed: Record<string, string> = {}): SessionMemory => {
  const store = new Map(Object.entries(seed))
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value)
    },
  }
}

const blockedMemory = (): SessionMemory => ({
  getItem: () => {
    throw new Error('site data is blocked')
  },
  setItem: () => {
    throw new Error('site data is blocked')
  },
})

describe('the system state machine', () => {
  it('reaches the desktop when the boot finishes', () => {
    expect(next('booting', 'booted')).toBe('desktop')
  })

  it('replays the boot on restart and lands back on the desktop', () => {
    expect(next(next('desktop', 'restart'), 'booted')).toBe('desktop')
  })

  it('sleeps, locks, and comes back', () => {
    expect(next('desktop', 'sleep')).toBe('sleeping')
    expect(next('sleeping', 'wake')).toBe('desktop')
    expect(next('desktop', 'lock')).toBe('locked')
    expect(next('locked', 'unlock')).toBe('desktop')
  })

  it('ignores an event the state has no rule for', () => {
    expect(next('booting', 'sleep')).toBe('booting')
    expect(next('restarting', 'unlock')).toBe('restarting')
    expect(next('desktop', 'booted')).toBe('desktop')
  })

  it('covers the screen while booting and while restarting', () => {
    const covered: SystemState[] = ['booting', 'restarting']
    const clear: SystemState[] = ['desktop', 'sleeping', 'locked', 'off']
    expect(covered.map(isBooting)).toEqual([true, true])
    expect(clear.map(isBooting)).toEqual([false, false, false, false])
  })

  it('shuts down to a screen only the power turns back on', () => {
    expect(next('desktop', 'shut-down')).toBe('off')
    expect(next('off', 'wake')).toBe('off')
    expect(next('off', 'unlock')).toBe('off')
    expect(next('off', 'power-on')).toBe('booting')
  })

  it('reaches every state from somewhere, apart from the one it starts in', () => {
    const events = ['booted', 'sleep', 'wake', 'lock', 'unlock', 'restart'] as const
    const reached = new Set(
      states.flatMap((from) => [
        ...events.map((event) => next(from, event)),
        next(from, 'shut-down'),
        next(from, 'power-on'),
      ]),
    )
    expect(states.filter((state) => !reached.has(state))).toEqual([])
  })
})

describe('the curtains', () => {
  it('gives every state that holds the desktop a way back to it', () => {
    const stuck = states.filter(
      (state) => state !== 'desktop' && !isBooting(state) && CURTAINS[state] === undefined,
    )
    expect(stuck).toEqual([])
  })

  it('leaves the state it is drawn over', () => {
    for (const [state, curtain] of Object.entries(CURTAINS)) {
      expect(next(state as SystemState, curtain.event)).not.toBe(state)
    }
  })

  it('says what to press, so a dark screen is not a crashed one', () => {
    expect(CURTAINS.sleeping?.label).toMatch(/wake/i)
    expect(CURTAINS.off?.label).toMatch(/turn on/i)
    expect(CURTAINS.locked?.label).toBe('Log in')
  })
})

describe('the once-per-session rule', () => {
  it('boots on the first load of a session', () => {
    expect(hasBootedAlready(fakeMemory())).toBe(false)
  })

  it('skips the boot once the session remembers one', () => {
    const memory = fakeMemory()
    rememberBoot(memory)
    expect(memory.getItem(BOOTED_KEY)).toBe('yes')
    expect(hasBootedAlready(memory)).toBe(true)
  })

  it('boots again when the browser refuses to remember', () => {
    const memory = blockedMemory()
    expect(() => rememberBoot(memory)).not.toThrow()
    expect(hasBootedAlready(memory)).toBe(false)
  })

  it('boots when there is no memory at all', () => {
    expect(hasBootedAlready(undefined)).toBe(false)
    expect(() => rememberBoot(undefined)).not.toThrow()
  })
})
