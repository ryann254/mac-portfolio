'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AppleLogo } from './apple-logo'
import {
  hasBootedAlready,
  isBooting,
  next,
  rememberBoot,
  type SystemState,
  sessionMemory,
} from './boot-state'

/**
 * The Apple boot, over the desktop rather than instead of it, so the desktop's
 * own markup is in the server response and paints underneath while this covers
 * it. That is what lets the reader land on a finished desktop the moment the
 * curtain lifts.
 *
 * How long it lasts is a CSS custom property, and the bar's own animation is
 * what ends it, so the length is written down once. React asks the animation
 * whether it has finished rather than waiting for its event: the bar starts
 * with the server HTML, and on a slow phone under reduced motion it can be over
 * before hydration, which used to leave the curtain stuck down for good.
 *
 * Any key or click skips it, and the session remembers, so a reload goes
 * straight to the desktop.
 */
export function BootScreen() {
  const [state, setState] = useState<SystemState>('booting')
  const bar = useRef<HTMLSpanElement>(null)
  const booting = isBooting(state)

  const finish = useCallback(() => {
    rememberBoot(sessionMemory())
    setState((current) => next(current, 'booted'))
  }, [])

  useEffect(() => {
    if (hasBootedAlready(sessionMemory())) {
      setState((current) => next(current, 'booted'))
      return
    }
    const running = bar.current?.getAnimations() ?? []
    // No animation at all means the browser has them switched off. Nothing is
    // going to tell us when the boot is over, so it is over now.
    if (running.length === 0) {
      finish()
      return
    }
    let live = true
    Promise.all(running.map((animation) => animation.finished))
      .then(() => live && finish())
      .catch(() => {
        // The animation was cancelled, which only happens when the element goes
        // away. Whatever did that owns the curtain now.
      })
    return () => {
      live = false
    }
  }, [finish])

  useEffect(() => {
    if (!booting) return
    window.addEventListener('keydown', finish)
    window.addEventListener('pointerdown', finish)
    return () => {
      window.removeEventListener('keydown', finish)
      window.removeEventListener('pointerdown', finish)
    }
  }, [booting, finish])

  useEffect(() => {
    /* The inline script in the layout hides this before the first paint when
       the session has seen it already. Handing control back to React once the
       curtain is down keeps Restart in phase 8 from meeting a stuck rule. */
    if (!booting) document.documentElement.removeAttribute('data-booted')
  }, [booting])

  return (
    <div
      data-boot=""
      data-testid="boot"
      data-done={booting ? undefined : ''}
      aria-hidden="true"
      className="absolute inset-0 z-[90] flex flex-col items-center justify-center gap-[34px] bg-black"
    >
      <AppleLogo className="size-[72px] fill-white" />
      <div className="h-1 w-64 overflow-hidden rounded-sm bg-white/20">
        <span
          ref={bar}
          data-boot-bar=""
          data-testid="boot-bar"
          className="block h-full w-0 rounded-sm bg-white"
        />
      </div>
    </div>
  )
}
