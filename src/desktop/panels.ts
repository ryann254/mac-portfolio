/**
 * The things that open over the desktop without being windows: the Apple menu,
 * Spotlight, Launchpad, Control Centre, and About This Site. One is up at a
 * time, which is what macOS does and also what keeps them out of each other's
 * way, so the shell holds which one rather than a flag apiece.
 */
export type Panel = 'apple' | 'spotlight' | 'launchpad' | 'control-centre' | 'about'

/**
 * Pressing the control that opened a panel closes it again, so the Apple logo
 * and the two menu bar icons are each one button rather than an open and a
 * close.
 */
export const panelAfter = (up: Panel | undefined, asked: Panel): Panel | undefined =>
  up === asked ? undefined : asked
