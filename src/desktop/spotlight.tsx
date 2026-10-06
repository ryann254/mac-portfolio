'use client'

import { useEffect, useRef, useState } from 'react'
import { type Hit, isOffsite, search } from './search'
import { putKeyboardIn } from './window-frame'
import { useWindows } from './window-store'

const RESULTS = 'spotlight-results'

/**
 * One box over the middle of the screen that searches everything the desktop
 * holds. `search.ts` does the ranking and knows what each row opens, so this
 * draws the list and moves the selection and nothing else.
 *
 * The rows are a listbox the box itself drives, which is what lets the arrow
 * keys walk the results while the reader goes on typing. They are buttons and
 * links underneath, so a pointer gets the same list without a second path.
 */
export function Spotlight() {
  const [query, setQuery] = useState('')
  const [at, setAt] = useState(0)
  const box = useRef<HTMLInputElement>(null)
  const open = useWindows((store) => store.open)
  const hits = search(query)
  const chosen = hits[at]

  useEffect(() => {
    box.current?.focus()
  }, [])

  const launch = (hit: Hit) => {
    if (isOffsite(hit.opens)) {
      globalThis.open(hit.opens.href, '_blank', 'noopener,noreferrer')
      return
    }
    open(hit.opens)
    putKeyboardIn(hit.opens.app)
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setAt((was) => Math.min(was + 1, hits.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setAt((was) => Math.max(was - 1, 0))
    } else if (event.key === 'Enter' && chosen) {
      launch(chosen)
    }
  }

  return (
    <div className="-translate-x-1/2 pointer-events-auto absolute top-[16%] left-1/2 w-[min(92vw,560px)] overflow-hidden rounded-xl border-[0.5px] border-black/20 bg-white/80 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl backdrop-saturate-150 motion-safe:animate-[panel-in_140ms_ease-out] dark:border-white/15 dark:bg-zinc-800/80">
      <div className="flex items-center gap-3 px-4">
        <Glass />
        <input
          ref={box}
          type="search"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setAt(0)
          }}
          onKeyDown={onKeyDown}
          aria-label="Spotlight Search"
          aria-expanded={hits.length > 0}
          aria-controls={RESULTS}
          aria-activedescendant={chosen ? rowId(chosen) : undefined}
          placeholder="Spotlight Search"
          className="w-full bg-transparent py-3.5 text-[19px] text-zinc-900 outline-none placeholder:text-zinc-500 dark:text-zinc-50 dark:placeholder:text-zinc-400"
        />
      </div>

      {query.trim() !== '' &&
        (hits.length === 0 ? (
          <p className="border-black/10 border-t px-4 py-2.5 text-[13px] text-zinc-600 dark:border-white/10 dark:text-zinc-400">
            Nothing here is called that.
          </p>
        ) : (
          /* A listbox the search box drives through `aria-activedescendant`,
             which is what keeps the keyboard in the box while the arrow keys
             walk the results. A div rather than a `ul`, because a list of
             options is not a list of list items. */
          <div
            role="listbox"
            id={RESULTS}
            aria-label="Results"
            className="max-h-[52vh] overflow-auto border-black/10 border-t py-1.5 dark:border-white/10"
          >
            {hits.map((hit, index) => (
              <Row
                key={hit.key}
                hit={hit}
                chosen={index === at}
                onPoint={() => setAt(index)}
                onPress={() => launch(hit)}
              />
            ))}
          </div>
        ))}
    </div>
  )
}

const rowId = (hit: Hit) => `spotlight-${hit.key}`

function Row({
  hit,
  chosen,
  onPoint,
  onPress,
}: {
  hit: Hit
  chosen: boolean
  onPoint: () => void
  onPress: () => void
}) {
  const inside = (
    <>
      {/* biome-ignore lint/performance/noImgElement: the dock's own icons, at a
          fixed size and already capped at 256 px. */}
      <img src={hit.icon} alt="" width={28} height={28} className="size-7 rounded-md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-[13.5px]">{hit.name}</span>
        {hit.detail && (
          <span className="block truncate text-[11.5px] text-zinc-600 dark:text-zinc-400">
            {hit.detail}
          </span>
        )}
      </span>
      <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">{hit.kind}</span>
    </>
  )

  const shared = `flex w-full items-center gap-3 px-4 py-1.5 text-left ${
    chosen ? 'bg-sky-600/90 text-white [&_span]:text-white' : 'text-zinc-900 dark:text-zinc-100'
  }`

  /* Out of the tab order on purpose: the keyboard never lands on a row, it
     drives them from the box. A pointer still presses them like anything else. */
  return isOffsite(hit.opens) ? (
    <a
      role="option"
      id={rowId(hit)}
      aria-selected={chosen}
      tabIndex={-1}
      href={hit.opens.href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={onPoint}
      className={shared}
    >
      {inside}
    </a>
  ) : (
    <button
      role="option"
      id={rowId(hit)}
      aria-selected={chosen}
      tabIndex={-1}
      type="button"
      onPointerEnter={onPoint}
      onClick={onPress}
      className={shared}
    >
      {inside}
    </button>
  )
}

const Glass = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0 fill-current opacity-55">
    <path d="M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />
  </svg>
)
