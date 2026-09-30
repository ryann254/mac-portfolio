'use client'

import Image from 'next/image'
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

      <div className="@container min-h-0 flex-1 overflow-auto px-[22px] pb-[18px]">
        <Reading page={page} />
      </div>
    </div>
  )
}

/** One project, read the way a page about it would be laid out. */
function Reading({ page }: { page: Page }) {
  return (
    <div className="grid grid-cols-1 items-start gap-[22px] @[620px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <Image
          src={page.shot.src}
          alt={page.shot.alt}
          width={640}
          height={400}
          className="aspect-[16/10] w-full rounded-[9px] object-cover shadow-[0_2px_14px_rgba(0,0,0,0.2)]"
        />
        <ul role="list" className="mt-2.5 flex flex-wrap gap-1.5">
          {page.stack.map((tool) => (
            <li
              key={tool}
              className="rounded-full bg-black/[0.06] px-2.5 py-[3px] text-[11.5px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-1 font-[650] text-[19px] text-zinc-900 tracking-[-0.015em] dark:text-zinc-50">
          {page.name}
        </h2>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400">{page.tagline}</p>
        <div className="mt-3 space-y-[11px] text-[13.5px]/[1.62] text-zinc-700 dark:text-zinc-300">
          {page.contribution.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <p className="mt-3 text-[13px] text-zinc-500 dark:text-zinc-400">
          {page.employer} · {page.period}
        </p>
        <p className="mt-3.5">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[7px] bg-sky-600 px-[13px] py-1.5 font-medium text-[13px] text-white hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
          >
            Open {page.host}
            <Leaving />
          </a>
        </p>
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
