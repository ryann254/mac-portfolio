/**
 * What the 404 window holds. Finder is the app that tells you a file is not
 * there, so an address nothing answers to gets the same window with the same
 * news in it.
 */
export function MissingFile() {
  return (
    <div className="flex flex-col gap-3 px-8 py-7 text-[13px]/relaxed text-zinc-700 dark:text-zinc-300">
      <h2 className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-50">
        Nothing answers to that address
      </h2>
      <p>
        Every window on this desktop has a URL of its own, and no window has this one. A character
        may have gone missing from the link on its way here.
      </p>
      <a
        href="/"
        className="self-start text-sky-700 underline underline-offset-2 dark:text-sky-400"
      >
        Back to the desktop
      </a>
    </div>
  )
}
