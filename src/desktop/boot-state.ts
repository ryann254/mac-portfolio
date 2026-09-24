/**
 * What the machine is doing. Phase 3 reaches `booting` and `desktop`; the Apple
 * menu in phase 8 reaches the other three and replays the boot for Restart.
 * The table is the whole rule, so a new state is a row rather than a branch
 * somewhere in a component.
 */
export type SystemState = 'booting' | 'desktop' | 'sleeping' | 'locked' | 'restarting'

export type SystemEvent = 'booted' | 'sleep' | 'wake' | 'lock' | 'unlock' | 'restart'

const TRANSITIONS: Record<SystemState, Partial<Record<SystemEvent, SystemState>>> = {
  booting: { booted: 'desktop' },
  desktop: { sleep: 'sleeping', lock: 'locked', restart: 'restarting' },
  sleeping: { wake: 'desktop', lock: 'locked', restart: 'restarting' },
  locked: { unlock: 'desktop', sleep: 'sleeping', restart: 'restarting' },
  restarting: { booted: 'desktop' },
}

/**
 * An event the current state has no rule for leaves it alone, the way a Mac
 * ignores the keyboard while it restarts.
 */
export const next = (state: SystemState, event: SystemEvent): SystemState =>
  TRANSITIONS[state][event] ?? state

/** The states that put the boot screen over everything. */
export const isBooting = (state: SystemState): boolean =>
  state === 'booting' || state === 'restarting'

export const BOOTED_KEY = 'mac-portfolio-booted'

export type SessionMemory = Pick<Storage, 'getItem' | 'setItem'>

/**
 * Chrome throws on `sessionStorage` rather than returning null when site data
 * is blocked, so every read and write goes through here. No memory means the
 * boot plays again, which is the friendlier of the two ways to be wrong.
 */
export function sessionMemory(): SessionMemory | undefined {
  try {
    return window.sessionStorage
  } catch {
    return undefined
  }
}

export const hasBootedAlready = (memory?: SessionMemory): boolean => {
  try {
    return memory?.getItem(BOOTED_KEY) === 'yes'
  } catch {
    return false
  }
}

export function rememberBoot(memory?: SessionMemory): void {
  try {
    memory?.setItem(BOOTED_KEY, 'yes')
  } catch {
    // Storage is blocked. The reader sees the boot again next load.
  }
}
