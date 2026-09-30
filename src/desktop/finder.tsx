'use client'

import { useState } from 'react'
import { FileIcon, FOLDER_ICON } from './file-icon'
import { around, type Node, nameAt, parentOf, rootOf, searchIn } from './file-tree'
import { canGoBack, canGoForward, where } from './finder-trail'
import { locations } from './locations'
import { MISSING_TITLE } from './routes'
import { useWindows } from './window-store'

/**
 * Finder. The sidebar and the file grid are here, the toolbar in the title bar
 * is `FinderBar`, and the two agree without talking to each other because both
 * read the same store: where Finder is, and what is typed in the search box.
 *
 * Nothing in this file knows a filename. Every folder and file comes from
 * `file-tree.ts`, which derives them from `src/content`.
 */
export function Finder() {
  const trail = useWindows((store) => store.trail)
  const finding = useWindows((store) => store.finding)
  const { goTo, open } = useWindows.getState()
  const at = where(trail)
  const root = rootOf(at)
  const found = searchIn(at, finding)

  /* Selection belongs to the folder it was made in, so walking into another one
     drops it without an effect to undo it. */
  const [pane, setPane] = useState<{ readonly at: string; readonly picked?: string }>({ at })
  const picked = pane.at === at ? pane.picked : undefined

  const reveal = (node: Node) => {
    if (node.kind === 'folder') return goTo(node.path)
    /* A file's kind is the id of the app that opens it, which is why there is no
       table here: a text file opens the text window and a picture the image one. */
    open({ app: node.kind, showing: node.path })
  }

  return (
    <div className="flex h-full min-h-0">
      <nav
        aria-label="Places"
        className="w-[186px] shrink-0 overflow-auto border-black/10 border-r-[0.5px] bg-zinc-100/55 p-2 dark:border-white/10 dark:bg-zinc-900/35"
      >
        <p className="px-2 pt-2 pb-1 font-semibold text-[11px] text-zinc-500 dark:text-zinc-400">
          Favourites
        </p>
        <ul role="list">
          {locations.map((location) => (
            <li key={location.slug}>
              <button
                type="button"
                data-place={location.slug}
                aria-current={location.slug === root ? 'page' : undefined}
                onClick={() => goTo(location.slug)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-[5px] text-left text-[13px] text-zinc-800 hover:bg-black/[0.06] aria-[current]:bg-black/[0.08] aria-[current]:font-medium focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:-outline-offset-2 dark:text-zinc-100 dark:hover:bg-white/10 dark:aria-[current]:bg-white/[0.14]"
              >
                {/* biome-ignore lint/performance/noImgElement: drawn art at a
                    fixed 15 px, and the optimiser refuses SVG without
                    dangerouslyAllowSVG. */}
                <img src={FOLDER_ICON} alt="" width={15} height={15} className="size-[15px]" />
                {location.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div data-testid="finder-pane" className="min-w-0 flex-1 overflow-auto px-[22px] py-[18px]">
        {found.length === 0 ? (
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
            {finding.trim() === ''
              ? 'This folder is empty.'
              : `Nothing in this folder matches "${finding.trim()}".`}
          </p>
        ) : (
          <ul
            role="list"
            className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] content-start gap-x-1 gap-y-1.5"
          >
            {found.map((node) => (
              <li key={node.path}>
                <button
                  type="button"
                  data-file={node.path}
                  data-picked={picked === node.path ? '' : undefined}
                  onClick={() => setPane({ at, picked: node.path })}
                  onDoubleClick={() => reveal(node)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') reveal(node)
                  }}
                  className="flex w-full flex-col items-center gap-[5px] rounded-[7px] px-1 pt-[9px] pb-[7px] text-center text-[12px] text-zinc-800 hover:bg-black/[0.05] data-[picked]:bg-sky-500/20 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:-outline-offset-2 dark:text-zinc-100 dark:hover:bg-white/[0.08]"
                >
                  <FileIcon node={node} />
                  <Marked name={node.name} query={finding} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** The toolbar, which macOS puts in the title bar rather than under it. */
export function FinderBar() {
  const trail = useWindows((store) => store.trail)
  const finding = useWindows((store) => store.finding)
  const { goBack, goForward, goUp, find } = useWindows.getState()
  const at = where(trail)
  const above = parentOf(at)

  /* The drag surface for the whole title bar sits underneath this row, so
     anything here that is not a control lets the pointer through to it and a
     Finder window can still be dragged by the empty part of its toolbar. */
  return (
    <div className="pointer-events-none relative flex min-w-0 flex-1 items-center gap-1.5 pr-3">
      <Step label="Back" onClick={goBack} able={canGoBack(trail)} turn="left" />
      <Step label="Forward" onClick={goForward} able={canGoForward(trail)} turn="right" />

      <nav
        aria-label="Where you are"
        className="ml-1 flex min-w-0 items-center gap-1 text-[13px] text-zinc-500 dark:text-zinc-400"
      >
        {above !== undefined && (
          <>
            <button
              type="button"
              onClick={goUp}
              className="pointer-events-auto shrink-0 rounded px-1 py-0.5 hover:bg-black/[0.06] hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-sky-600 dark:hover:bg-white/10 dark:hover:text-zinc-100"
            >
              {nameAt(above)}
            </button>
            <Chevron turn="right" className="size-[13px] shrink-0 opacity-55" />
          </>
        )}
        <span className="truncate font-semibold text-zinc-800 dark:text-zinc-100">
          {nameAt(at) ?? MISSING_TITLE}
        </span>
      </nav>

      <div className="pointer-events-auto ml-auto flex min-w-[130px] items-center gap-1.5 rounded-[7px] bg-black/[0.06] px-2 py-[3px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
        <Glass />
        <input
          type="search"
          name="finder-search"
          value={finding}
          aria-label="Search this folder"
          placeholder="Search"
          onChange={(event) => find(event.target.value)}
          /* Escape closes the window this sits in, which is not what a reader
             typing in a search box means by it. */
          onKeyDown={(event) => {
            if (event.key !== 'Escape') return
            event.stopPropagation()
            find('')
          }}
          className="w-full min-w-0 bg-transparent text-[12px] text-zinc-800 outline-none placeholder:text-zinc-500 dark:text-zinc-100 dark:placeholder:text-zinc-400"
        />
      </div>
    </div>
  )
}

/** A file name with the part a reader searched for marked in it. */
function Marked({ name, query }: { name: string; query: string }) {
  const [before, hit, after] = around(name, query)
  return (
    <span className="break-words leading-[1.25]">
      {before}
      {hit !== '' && <mark className="rounded-[3px] bg-sky-500 px-[3px] text-white">{hit}</mark>}
      {after}
    </span>
  )
}

function Step({
  label,
  onClick,
  able,
  turn,
}: {
  label: string
  onClick: () => void
  able: boolean
  turn: 'left' | 'right'
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={!able}
      onClick={onClick}
      className="pointer-events-auto rounded-[5px] p-0.5 text-zinc-500 hover:bg-black/[0.06] disabled:opacity-35 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-sky-600 dark:text-zinc-400 dark:hover:bg-white/10"
    >
      <Chevron turn={turn} className="size-[15px]" />
    </button>
  )
}

const Chevron = ({ turn, className }: { turn: 'left' | 'right'; className: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path
      d={
        turn === 'left'
          ? 'M15 5.4 8.4 12l6.6 6.6 1.3-1.3L11 12l5.3-5.3z'
          : 'M9 5.4 15.6 12 9 18.6l-1.3-1.3L13 12 7.7 6.7z'
      }
    />
  </svg>
)

const Glass = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-3 shrink-0">
    <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />
  </svg>
)
