'use client'

import Image from 'next/image'
import { Prose } from './prose'
import type { Target } from './routes'
import { type Page, pageAt, pages } from './safari-tabs'
import { useWindows } from './window-store'

/**
 * Safari. A tab per project and the project itself under it. The tabs look like
 * Safari's but are plain buttons marking the one in front, rather than the ARIA
 * tab pattern, which would take every project off Tab and put it behind an
 * arrow key for nothing: there is one panel and switching it moves the address
 * and the window's name with it.
 *
 * There is no iframe. Three of the five sites refuse to be framed, so the window
 * shows the screenshot we took and the button goes to the real thing.
 */
export function Safari({ target }: { target: Target }) {
  const open = useWindows((store) => store.open)
  const page = pageAt(target.showing)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav
        aria-label="Project tabs"
        className="flex shrink-0 gap-1.5 overflow-x-auto border-black/10 border-b-[0.5px] bg-zinc-100/70 px-3 pt-1.5 dark:border-white/10 dark:bg-zinc-900/60"
      >
        {pages.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            data-tab={tab.slug}
            aria-current={tab.slug === page.slug ? 'page' : undefined}
            onClick={() => open({ app: 'safari', showing: tab.slug })}
            className="max-w-[190px] truncate rounded-t-[8px] bg-black/[0.06] px-3 py-1.5 text-[12.5px] text-zinc-500 aria-[current]:bg-white/85 aria-[current]:font-medium aria-[current]:text-zinc-900 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:-outline-offset-2 dark:bg-white/[0.07] dark:text-zinc-400 dark:aria-[current]:bg-zinc-800/85 dark:aria-[current]:text-zinc-50"
          >
            {tab.name}
          </button>
        ))}
      </nav>

      <p className="mx-3 mt-[7px] mb-[9px] flex shrink-0 items-center gap-[7px] rounded-lg bg-black/[0.06] px-[11px] py-[5px] text-[12.5px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
        <Padlock />
        <span className="truncate text-zinc-800 dark:text-zinc-100">{page.host}</span>
      </p>

      <div className="@container min-h-0 flex-1 overflow-auto">
        <Reading page={page} />
      </div>
    </div>
  )
}

/**
 * One project. The screenshot runs the full width of the window, which is what
 * a browser showing a site looks like.
 *
 * All five screenshots are one 1440x900 view of a homepage, so no height shows
 * a whole one and every crop lands somewhere different. It fades out rather
 * than stopping on a line, because a line through the middle of a site's own
 * headline reads as a mistake and a fade reads as the page carrying on. For
 * the same reason nothing is laid over the picture: each of these sites has a
 * headline of its own in it already.
 */
function Reading({ page }: { page: Page }) {
  return (
    <div className="flex flex-col">
      <Image
        key={page.slug}
        src={page.shot.src}
        alt={page.shot.alt}
        width={1200}
        height={520}
        className="h-[156px] w-full shrink-0 object-cover object-top [mask-image:linear-gradient(to_bottom,#000_72%,transparent)] @[560px]:h-[212px]"
      />

      <div className="flex flex-col gap-3.5 px-[22px] pt-3.5 pb-[18px]">
        <div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-2.5">
          <div>
            <h2 className="font-[650] text-[21px] text-zinc-900 tracking-[-0.02em] dark:text-zinc-50">
              {page.name}
            </h2>
            <p className="mt-[3px] max-w-[62ch] text-[13.5px] text-zinc-500 dark:text-zinc-400">
              {page.tagline}
            </p>
          </div>
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[7px] bg-sky-600 px-[13px] py-[7px] font-medium text-[13px] text-white hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
          >
            Open {page.host}
            <Leaving />
          </a>
        </div>

        {page.results.length > 0 && (
          <ul role="list" className="flex flex-wrap gap-2.5">
            {page.results.map((result) => (
              <li
                key={result.of}
                data-result={result.value}
                className="min-w-[180px] flex-1 rounded-[9px] bg-black/[0.05] px-[13px] py-[9px] dark:bg-white/[0.08]"
              >
                <b className="block font-[680] text-[21px] text-sky-700 tracking-[-0.02em] dark:text-sky-400">
                  {result.value}
                </b>
                <span className="mt-px block text-[12px] text-zinc-500 dark:text-zinc-400">
                  {result.of}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="@[560px]:columns-2 @[560px]:gap-x-[26px]">
          {page.contribution.map((line) => (
            <p
              key={line}
              className="mb-2.5 break-inside-avoid text-[13.5px]/[1.66] text-zinc-700 dark:text-zinc-300"
            >
              <Prose sentence={line} />
            </p>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <ul role="list" className="flex flex-wrap gap-1.5">
            {page.stack.map((tool) => (
              <li
                key={tool}
                className="rounded-full bg-black/[0.06] px-2.5 py-[3px] text-[11.5px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
              >
                {tool}
              </li>
            ))}
          </ul>
          <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400">
            {page.employer} · {page.period}
          </p>
        </div>
      </div>
    </div>
  )
}

const Padlock = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[11px] shrink-0">
    <path d="M12 2a5 5 0 0 1 5 5v2h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h1V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v2h6V7a3 3 0 0 0-3-3z" />
  </svg>
)

/** The arrow macOS puts on anything that leaves the app you are in. */
const Leaving = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3.5 shrink-0">
    <path d="M7 6h11v11h-2V9.4L7.7 17.7 6.3 16.3 14.6 8H7z" />
  </svg>
)
