'use client'

import Image from 'next/image'
import { useState } from 'react'
import { type Shot, shots } from './project-view'

/**
 * Photos, over the same five screenshots Safari uses. One fills the window when
 * it is pressed, and the whole enlarged view is the way back, with the way back
 * written at the top of it: the mockup left that to a hint in the caption, which
 * a keyboard never reaches and a reader who scrolled past never sees.
 */
export function Photos() {
  const [open, setOpen] = useState<Shot | undefined>(undefined)

  if (open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(undefined)}
        className="flex h-full w-full min-h-0 cursor-zoom-out flex-col gap-2.5 px-[22px] py-[18px] text-left focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:-outline-offset-2"
      >
        <span className="flex shrink-0 items-center gap-0.5 text-[13px] text-zinc-500 dark:text-zinc-400">
          <Chevron />
          All photos
        </span>
        <Image
          src={open.src}
          alt={open.alt}
          width={1024}
          height={640}
          className="mx-auto min-h-0 max-h-full w-auto rounded-[7px] object-contain"
        />
        <span className="shrink-0 text-center text-[12.5px] text-zinc-500 dark:text-zinc-400">
          {open.name}. {open.note}
        </span>
      </button>
    )
  }

  return (
    <ul
      role="list"
      className="@container grid h-full grid-cols-2 content-start gap-2.5 overflow-auto px-[22px] py-[18px] @[560px]:grid-cols-3"
    >
      {shots.map((shot) => (
        <li key={shot.slug}>
          <button
            type="button"
            data-shot={shot.slug}
            onClick={() => setOpen(shot)}
            className="block w-full cursor-zoom-in overflow-hidden rounded-[7px] focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
          >
            <Image
              src={shot.src}
              alt={shot.name}
              width={360}
              height={225}
              className="aspect-[16/10] w-full object-cover"
            />
          </button>
        </li>
      ))}
    </ul>
  )
}

const Chevron = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-[15px] shrink-0">
    <path d="M15 5.4 8.4 12l6.6 6.6 1.3-1.3L11 12l5.3-5.3z" />
  </svg>
)
