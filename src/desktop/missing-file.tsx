'use client'

import { usePathname } from 'next/navigation'
import { useWindows } from './window-store'

/**
 * What the 404 window holds. Finder is the app that tells you a file is not
 * there, so an address nothing answers to gets the same window with the same
 * news in it, and it names the address rather than making the reader go and
 * look at their own URL bar.
 */
export function MissingFile() {
  const path = usePathname()
  const clear = useWindows((store) => store.clear)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 py-7 text-center">
      <QuestionFolder />
      <h2 className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-50">
        There is nothing at that address
      </h2>
      <p className="max-w-[38ch] text-[13px]/relaxed text-zinc-600 dark:text-zinc-400">
        <code className="font-mono">{path}</code> is not a folder on this desktop. Either the link
        is old or I never made that page.
      </p>
      <a
        href="/"
        onClick={(event) => {
          /* The desktop is already on screen, so there is nothing to fetch.
             Clearing it is what `/` means, and `window-url.ts` puts the address
             back on its own. Without script the link still works as a link. */
          event.preventDefault()
          clear()
        }}
        className="rounded-md bg-sky-600 px-3 py-1.5 font-medium text-[13px] text-white hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
      >
        Back to the desktop
      </a>
    </div>
  )
}

/** The folder icon, greyed out, with the question the address asked in it. */
const QuestionFolder = () => (
  <svg viewBox="0 0 64 52" aria-hidden="true" className="h-16 w-[78px]">
    <path
      d="M2 9a6 6 0 0 1 6-6h13l6 6h29a6 6 0 0 1 6 6v29a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z"
      fill="#b9c2cc"
    />
    <path
      d="M2 15a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v29a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z"
      fill="#d4dbe3"
    />
    <text x="33" y="43" textAnchor="middle" fontSize="26" fontWeight="700" fill="#7c8894">
      ?
    </text>
  </svg>
)
