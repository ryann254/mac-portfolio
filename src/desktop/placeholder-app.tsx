import type { App } from './apps'

/**
 * What every window shows in phase 4. The phase builds the frame, so the frame
 * is what it has to prove; phases 6 to 8 put Finder, Safari, Terminal, Photos,
 * the resume, and the contact form behind these same windows.
 */
export function PlaceholderApp({ app }: { app: App }) {
  return (
    <div className="flex flex-col gap-3 px-8 py-7 text-[13px]/relaxed text-zinc-700 dark:text-zinc-300">
      <h2 className="font-semibold text-[15px] text-zinc-900 dark:text-zinc-50">
        {app.name} opens here once it is built
      </h2>
      <p>
        The frame around it already works. Drag the title bar to move the window. Pull any edge or
        corner to resize it. The three buttons top left close it, send it to the dock, and fill the
        screen.
      </p>
      <p className="text-zinc-500 dark:text-zinc-400">
        Escape closes whichever window the keyboard is in.
      </p>
    </div>
  )
}
