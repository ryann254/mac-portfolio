/**
 * What the machine is doing. The boot reaches `booting` and `desktop`; the
 * Apple menu reaches the other four. The table is the whole rule, so a new
 * state is a row rather than a branch somewhere in a component.
 *
 * `booting` and `restarting` both play the boot, and they are two states
 * because only one of them can be skipped: `booting` is the one the page starts
 * in, which a session that has already watched it goes straight past, and
 * `restarting` is a boot the reader asked for, by Restart or by turning the
 * machine back on, which always plays.
 */
export type SystemState = 'booting' | 'desktop' | 'sleeping' | 'locked' | 'restarting' | 'off'

export type SystemEvent =
  | 'booted'
  | 'sleep'
  | 'wake'
  | 'lock'
  | 'unlock'
  | 'restart'
  | 'shut-down'
  | 'power-on'

const TRANSITIONS: Record<SystemState, Partial<Record<SystemEvent, SystemState>>> = {
  booting: { booted: 'desktop' },
  desktop: { sleep: 'sleeping', lock: 'locked', restart: 'restarting', 'shut-down': 'off' },
  sleeping: { wake: 'desktop', lock: 'locked', restart: 'restarting', 'shut-down': 'off' },
  locked: { unlock: 'desktop', sleep: 'sleeping', restart: 'restarting', 'shut-down': 'off' },
  restarting: { booted: 'desktop' },
  off: { 'power-on': 'restarting' },
}

/**
 * Every state there is. The table's keys are the states by construction, which
 * is why this is read off it rather than written out again: a state added above
 * cannot be left out of here, and the tests walk all of them.
 */
export const states = Object.keys(TRANSITIONS) as readonly SystemState[]

/**
 * An event the current state has no rule for leaves it alone, the way a Mac
 * ignores the keyboard while it restarts.
 */
export const next = (state: SystemState, event: SystemEvent): SystemState =>
  TRANSITIONS[state][event] ?? state

/** The states that put the boot screen over everything. */
export const isBooting = (state: SystemState): boolean =>
  state === 'booting' || state === 'restarting'

export type Curtain = {
  /** What the one control on the curtain sends. */
  readonly event: SystemEvent
  /** What that control says, which is also what a screen reader hears. */
  readonly label: string
}

/**
 * The states that hold the desktop behind a curtain a reader has to lift, and
 * what lifts each one. A state missing from here is one the machine leaves on
 * its own, so the curtain needs no branch per state and no state can arrive
 * with no way back to the desktop.
 */
export const CURTAINS: Partial<Record<SystemState, Curtain>> = {
  sleeping: { event: 'wake', label: 'Press anywhere to wake' },
  locked: { event: 'unlock', label: 'Log in' },
  off: { event: 'power-on', label: 'Press anywhere to turn on' },
}

export const BOOTED_KEY = 'mac-portfolio-booted'

/**
 * Runs before the first paint. The boot markup is in the server response so it
 * paints without waiting for JavaScript, which also means a reload would flash
 * it before React could say otherwise. This hides it in the same tick instead.
 */
export const SKIP_BOOT_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(BOOTED_KEY)})==='yes')document.documentElement.dataset.booted=''}catch(e){}`

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
