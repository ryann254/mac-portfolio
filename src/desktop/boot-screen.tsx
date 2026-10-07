'use client'

import { useCallback, useEffect, useRef } from 'react'
import { AppleLogo } from './apple-logo'
import { hasBootedAlready, isBooting, rememberBoot, sessionMemory } from './system-state'
import { useSystem } from './system-store'

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
 * straight to the desktop. Apple menu > Restart puts the machine back in a
 * booting state and the bar runs again, which is the whole of Restart.
 */
export function BootScreen() {
  const state = useSystem((store) => store.state)
  const send = useSystem((store) => store.send)
  const bar = useRef<HTMLSpanElement>(null)
  const booting = isBooting(state)

  const finish = useCallback(() => {
    rememberBoot(sessionMemory())
    send('booted')
  }, [send])

  useEffect(() => {
    if (!booting) return
    /* The session has watched the boot already, so the script in the layout
       hid this before the first paint and there is no animation to wait for. A
       restart is not that: the reader asked for the boot, so it plays. */
    if (state === 'booting' && hasBootedAlready(sessionMemory())) {
      finish()
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
  }, [booting, state, finish])

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
    /* The script in the layout hides this before the first paint when the
       session has seen it already. Handing control back to React once the
       curtain is down is what lets Restart show it again. */
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
        {/* Keyed on the state so a restart gets a new element and the fill runs
            from nothing again. An animation that has already finished cannot be
            asked to play a second time. */}
        <span
          key={state}
          ref={bar}
          data-boot-bar=""
          data-testid="boot-bar"
          className="block h-full w-0 rounded-sm bg-white"
        />
      </div>
    </div>
  )
}
