'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { type AppId, appById } from './apps'
import { isMissingFolder } from './file-tree'
import { MissingFile } from './missing-file'
import { PlaceholderApp } from './placeholder-app'
import type { Target } from './routes'

/**
 * What each app puts in its window: a body, and for the apps that have any,
 * controls in the title bar. One table per slot, so an app is wired up by being
 * named here and nowhere else.
 *
 * Every app comes in through `next/dynamic`, which is what keeps the first load
 * down to the shell: none of this is fetched until a window opens. `pnpm size`
 * fails the build if that slips.
 */
type Part = ComponentType<{ target: Target }>

const bodies: Partial<Record<AppId, Part>> = {
  finder: dynamic(() => import('./finder').then((module) => module.Finder)),
  text: dynamic(() => import('./text-window').then((module) => module.TextWindow)),
  image: dynamic(() => import('./image-window').then((module) => module.ImageWindow)),
}

const bars: Partial<Record<AppId, Part>> = {
  finder: dynamic(() => import('./finder').then((module) => module.FinderBar)),
}

export function AppBody({ target }: { target: Target }) {
  if (isMissingFolder(target)) return <MissingFile />
  const Body = bodies[target.app]
  return Body ? <Body target={target} /> : <PlaceholderApp app={appById(target.app)} />
}

/**
 * The title bar past the three buttons: an app's own controls, or, for an app
 * with none and for a window on a folder that is not there, the window's name.
 */
export function AppChrome({ target, title }: { target: Target; title: string }) {
  const Bar = isMissingFolder(target) ? undefined : bars[target.app]
  if (Bar) return <Bar target={target} />
  return (
    <span className="-translate-x-1/2 pointer-events-none absolute left-1/2 font-medium text-[13px] text-zinc-700 dark:text-zinc-200">
      {title}
    </span>
  )
}
