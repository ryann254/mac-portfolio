import { type Row, rows } from './contact-rows'

/**
 * Contact. Three rows and no form: a form needs a backend, a place to read the
 * mail, and an answer for the spam, and none of that helps a recruiter who
 * already has a mail client open. The address is in the open on purpose.
 */
export function Contact() {
  return (
    <div className="h-full overflow-auto px-[22px] py-[18px]">
      <h2 className="mb-1 font-[650] text-[19px] text-zinc-900 tracking-[-0.015em] dark:text-zinc-50">
        Get in touch
      </h2>
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
        I read email every day and I reply. Nairobi time, so if you are in the US expect me in your
        morning.
      </p>
      <ul
        role="list"
        className="mt-3.5 overflow-hidden rounded-[10px] border-[0.5px] border-black/10 dark:border-white/10"
      >
        {rows.map((row) => (
          <li
            key={row.label}
            className="border-black/10 border-t-[0.5px] first:border-t-0 dark:border-white/10"
          >
            <Reach row={row} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function Reach({ row }: { row: Row }) {
  const offsite = row.kind === 'offsite'

  return (
    <a
      href={row.href}
      {...(offsite ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-3 px-3.5 py-3 text-zinc-900 hover:bg-black/[0.05] focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:-outline-offset-2 dark:text-zinc-50 dark:hover:bg-white/[0.08]"
    >
      {/* biome-ignore lint/performance/noImgElement: the dock's own art at a fixed 26 px, which the optimiser would charge a round trip to hand back unchanged. */}
      <img
        src={row.icon}
        alt=""
        width={26}
        height={26}
        className="size-[26px] shrink-0 rounded-md"
      />
      <span className="min-w-0">
        <span className="block font-medium text-[13px]">{row.label}</span>
        <span className="block truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">
          {row.value}
        </span>
      </span>
      <span className="ml-auto shrink-0 text-zinc-400 dark:text-zinc-500">
        {offsite ? <Leaving /> : <Onward />}
      </span>
    </a>
  )
}

/** Offsite, the way macOS marks anything that leaves the app you are in. */
const Leaving = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M7 6h11v11h-2V9.4L7.7 17.7 6.3 16.3 14.6 8H7z" />
  </svg>
)

/** Onward, which is where the mail app opens rather than a tab. */
const Onward = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
    <path d="M13.2 5.6 19.6 12l-6.4 6.4-1.4-1.4 4-4H4.5v-2h11.3l-4-4z" />
  </svg>
)
