'use client'

import { useEffect, useRef } from 'react'
import { profile } from '@/content'
import { menuBarTime } from './clock'
import { CURTAINS, type Curtain } from './system-state'
import { useSystem } from './system-store'
import { useClock } from './use-clock'

/**
 * What the Apple menu puts over the desktop. Sleep and Shut Down are both a
 * dark screen with one thing to press, and the only difference a reader can
 * see is what it says; Lock Screen is the login screen Daniel Prior's version
 * opens on, which this site keeps off the load path and behind the menu instead.
 *
 * Which states get a curtain and what lifts each one is the table in
 * `system-state.ts`, so there is no state that can arrive here with no way back
 * to the desktop.
 */
export function SystemCurtain() {
  const state = useSystem((store) => store.state)
  const send = useSystem((store) => store.send)
  const curtain = CURTAINS[state]
  if (curtain === undefined) return null

  const lift = () => send(curtain.event)
  return state === 'locked' ? (
    <LockScreen curtain={curtain} onLift={lift} />
  ) : (
    <DarkScreen curtain={curtain} onLift={lift} />
  )
}

/**
 * The whole screen is the button, the way the whole machine is while it sleeps.
 * A Mac shows nothing at all here, which on a web page reads as a site that has
 * crashed, so the one line it holds is both the hint and the button's name. It
 * is dim rather than faint: the first draft was white at 35%, which is 2.9:1 on
 * black, and `tests/system.spec.ts` now holds it to 4.5.
 */
function DarkScreen({ curtain, onLift }: { curtain: Curtain; onLift: () => void }) {
  const press = useRef<HTMLButtonElement>(null)

  /* The keyboard goes to the screen itself, so Enter or Space lifts it without
     the reader having to find anything to press first. */
  useEffect(() => {
    press.current?.focus()
  }, [])

  return (
    <button
      ref={press}
      type="button"
      data-testid="dark-screen"
      onClick={onLift}
      className="absolute inset-0 z-[90] cursor-default bg-black text-center text-[13px] text-white/55 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white/40"
    >
      {curtain.label}
    </button>
  )
}

function LockScreen({ curtain, onLift }: { curtain: Curtain; onLift: () => void }) {
  const now = useClock()

  return (
    <div
      data-testid="lock-screen"
      className="absolute inset-0 z-[90] flex flex-col items-center justify-center gap-5 bg-black/55 backdrop-blur-2xl"
    >
      <p className="tabular-nums text-[56px] text-white/90 leading-none">
        {now ? menuBarTime(now) : ''}
      </p>
      {/* biome-ignore lint/performance/noImgElement: a drawn stand-in that
          scales on its own, and the optimiser refuses SVG without
          dangerouslyAllowSVG. */}
      <img
        src="/about/avatar.svg"
        alt=""
        width={76}
        height={76}
        className="size-[76px] rounded-full border border-white/25"
      />
      <p className="font-medium text-[15px] text-white">{profile.name}</p>
      <button
        type="button"
        onClick={onLift}
        className="rounded-full border-[0.5px] border-white/30 bg-white/15 px-5 py-1.5 text-[13px] text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
      >
        {curtain.label}
      </button>
    </div>
  )
}
