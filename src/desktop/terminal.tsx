import { Fragment } from 'react'
import { AppleLogo } from './apple-logo'
import { type Row, transcript } from './terminal-transcript'

/**
 * Terminal, holding a transcript that has already run. Nothing is typed at the
 * prompt in v1; the caret sits there because a shell with no caret looks dead.
 *
 * The window is the near-black a terminal keeps in both themes, which is why
 * nothing here has a dark variant.
 */
export function Terminal() {
  const { card, typed, skills } = transcript(new Date())

  return (
    <div className="h-full overflow-auto bg-[#141416]/90 px-4 py-3.5 font-mono text-[12.5px]/[1.62] text-zinc-200">
      <div className="mb-3.5 flex items-start gap-5">
        {/* The mark is drawn once, in `apple-logo.tsx`, with no fill of its own,
            so the six stripes are a fill inherited from here. */}
        <RainbowStripes />
        <div className="shrink-0" style={{ fill: `url(#${STRIPES})` }}>
          <AppleLogo className="size-[76px]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-[12.5px] text-[#f0b429]">ryan@portfolio</h2>
          <p className="text-[#8d8d93]">--------------</p>
          <Rows rows={card} />
        </div>
      </div>

      <p>
        <Prompt />
        {typed}
      </p>
      <div className="my-2 mb-3.5">
        <Rows rows={skills} />
      </div>
      <p>
        <Prompt />
        <span className="inline-block h-3.5 w-[7px] translate-y-[2px] bg-zinc-200 motion-safe:animate-[blink_1.1s_step-end_infinite]" />
      </p>
    </div>
  )
}

/** A key and its value, lined up in two columns the way `neofetch` prints them. */
function Rows({ rows }: { rows: readonly Row[] }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-3.5">
      {rows.map((row) => (
        <Fragment key={row.key}>
          <dt className="text-[#5ccf7f]">{row.key}</dt>
          <dd className="min-w-0">{row.value}</dd>
        </Fragment>
      ))}
    </dl>
  )
}

/** The id the card's mark fills itself from. One Terminal window, one of these. */
const STRIPES = 'terminal-apple-stripes'

/** The six colours the Apple of that era had, top to bottom. */
const RainbowStripes = () => (
  <svg aria-hidden="true" className="absolute size-0">
    <linearGradient id={STRIPES} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#5dc22d" />
      <stop offset="20%" stopColor="#f6c500" />
      <stop offset="40%" stopColor="#f28d00" />
      <stop offset="60%" stopColor="#e5352b" />
      <stop offset="80%" stopColor="#a1257f" />
      <stop offset="100%" stopColor="#2b86c5" />
    </linearGradient>
  </svg>
)

const Prompt = () => (
  <>
    <span className="text-[#5ccf7f]">&rarr;</span> <span className="text-[#62b0ff]">~</span>{' '}
  </>
)
