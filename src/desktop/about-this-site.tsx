'use client'

import { profile } from '@/content'
import { AppleLogo } from './apple-logo'
import { useSystem } from './system-store'

/**
 * About This Mac, for a Mac that is a web page. It says what the site is made
 * of, and it is where the credit the README carries also reaches a reader who
 * will never open the repository.
 */
const ROWS: readonly { readonly label: string; readonly value: string }[] = [
  { label: 'Built with', value: 'Next.js, React, TypeScript, Tailwind' },
  { label: 'Hosted on', value: 'Vercel' },
  { label: 'Wallpaper', value: 'Drawn as SVG. The same picture as a photograph is 380 kB.' },
  { label: 'Icons', value: "Apple's own, as every macOS portfolio uses." },
]

const CREDITS: readonly { readonly name: string; readonly href: string }[] = [
  {
    name: "Daniel Prior's danielprior-macos",
    href: 'https://github.com/daprior/danielprior-macos',
  },
  { name: "JavaScript Mastery's macOS build", href: 'https://youtu.be/j9ZD_hlyHOA' },
]

export function AboutThisSite() {
  const closePanel = useSystem((store) => store.closePanel)

  return (
    <section
      aria-labelledby="about-this-site"
      data-testid="about-this-site"
      className="-translate-x-1/2 -translate-y-1/2 pointer-events-auto absolute top-1/2 left-1/2 w-[min(92vw,420px)] rounded-2xl border-[0.5px] border-black/15 bg-white/85 p-7 text-center shadow-[0_26px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl motion-safe:animate-[panel-in_140ms_ease-out] dark:border-white/15 dark:bg-zinc-800/85"
    >
      <AppleLogo className="mx-auto size-11 fill-zinc-800 dark:fill-zinc-100" />
      <h2
        id="about-this-site"
        className="mt-3.5 font-semibold text-[17px] text-zinc-900 dark:text-zinc-50"
      >
        {profile.name}'s portfolio
      </h2>
      <p className="mt-1 text-[12.5px] text-zinc-600 dark:text-zinc-400">
        {profile.headline} in {profile.location}
      </p>

      <dl className="mt-5 grid grid-cols-[max-content_1fr] gap-x-3.5 gap-y-1.5 text-left text-[12px]">
        {ROWS.map((row) => (
          <div key={row.label} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-zinc-500 dark:text-zinc-400">{row.label}</dt>
            <dd className="text-zinc-800 dark:text-zinc-200">{row.value}</dd>
          </div>
        ))}
        <div className="col-span-2 grid grid-cols-subgrid">
          <dt className="text-zinc-500 dark:text-zinc-400">Thanks to</dt>
          <dd className="text-zinc-800 dark:text-zinc-200">
            {CREDITS.map((credit, index) => (
              <span key={credit.href}>
                {index > 0 && ', '}
                <a
                  href={credit.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-700 dark:decoration-zinc-500"
                >
                  {credit.name}
                </a>
              </span>
            ))}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={closePanel}
        className="mt-6 rounded-lg bg-black/5 px-4 py-1.5 text-[12.5px] text-zinc-800 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 dark:bg-white/10 dark:text-zinc-100"
      >
        Close
      </button>
    </section>
  )
}
