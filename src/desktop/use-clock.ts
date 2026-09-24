'use client'

import { useEffect, useState } from 'react'

/**
 * Wakes on the minute rather than every second, since neither clock shows
 * seconds, with a little slack so two of them never land either side of the
 * turn and show different minutes.
 */
const SLACK_MS = 50

/**
 * The reader's wall clock. Undefined until the component mounts: the server has
 * no idea what time it is where they are, and rendering its own guess would
 * hydrate into the wrong minute.
 */
export function useClock(): Date | undefined {
  const [now, setNow] = useState<Date>()

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const at = new Date()
      setNow(at)
      const untilNextMinute = 60_000 - (at.getSeconds() * 1000 + at.getMilliseconds())
      timer = window.setTimeout(tick, untilNextMinute + SLACK_MS)
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [])

  return now
}
