'use client'

import Image from 'next/image'
import { useState } from 'react'
import { type Shot, shots } from './project-view'

/**
 * Photos, over the same five screenshots Safari uses. Click one to fill the
 * window with it, click it again to come back, which is what Photos does and
 * what makes the grid worth having over a list.
 */
export function Photos() {
  const [open, setOpen] = useState<Shot | undefined>(undefined)

  if (open) {
    return (
      <div className="h-full overflow-auto px-[22px] py-[18px]">
        <button
          type="button"
          onClick={() => setOpen(undefined)}
          className="w-full cursor-zoom-out rounded-[7px] focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2"
        >
          <Image
            src={open.src}
            alt={open.alt}
            width={1024}
            height={640}
            className="w-full rounded-[7px]"
          />
        </button>
        <p className="mt-2.5 text-center text-[13px] text-zinc-500 dark:text-zinc-400">
          {open.name}. {open.note}
        </p>
      </div>
    )
  }

  return (
    <ul
      role="list"
      className="grid h-full grid-cols-2 content-start gap-2.5 overflow-auto px-[22px] py-[18px] sm:grid-cols-3"
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
