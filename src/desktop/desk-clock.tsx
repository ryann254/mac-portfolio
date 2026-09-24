'use client'

import { flipDate, flipDigits } from './clock'
import { useClock } from './use-clock'

/**
 * The flip clock in the bottom right corner. Hidden on a phone, where the dock
 * runs across the bottom and there is nowhere for it to sit; phase 9 gives the
 * mobile layout its own status bar.
 */
export function DeskClock() {
  const now = useClock()
  if (!now) return null

  return (
    <div
      data-testid="desk-clock"
      className="absolute right-11 bottom-[30px] z-10 hidden text-center text-white sm:block"
    >
      <p className="mb-3 font-semibold text-sm tracking-[0.16em] [text-shadow:0_1px_3px_rgba(0,0,0,0.55),0_0_14px_rgba(0,0,0,0.4)]">
        {flipDate(now)}
      </p>
      <div className="flex items-center gap-[9px]">
        <Pair digits={flipDigits(now).slice(0, 2)} />
        <span className="font-semibold text-[42px] opacity-90 [text-shadow:0_1px_10px_rgba(0,0,0,0.4)]">
          :
        </span>
        <Pair digits={flipDigits(now).slice(2)} />
      </div>
    </div>
  )
}

const Pair = ({ digits }: { digits: readonly string[] }) => (
  <span className="flex gap-1.5">
    {digits.map((digit, index) => (
      <span
        // Two cards in a pair can hold the same digit, so the position is the key.
        key={index === 0 ? 'left' : 'right'}
        className="relative grid h-[94px] w-[70px] place-items-center rounded-[11px] bg-[rgba(22,18,32,0.74)] font-medium text-[56px] tabular-nums leading-none shadow-[0_7px_22px_rgba(0,0,0,0.26),inset_0_0_0_0.5px_rgba(255,255,255,0.12)] backdrop-blur-md after:absolute after:inset-x-0 after:top-1/2 after:h-px after:bg-black/30 after:content-['']"
      >
        {digit}
      </span>
    ))}
  </span>
)
