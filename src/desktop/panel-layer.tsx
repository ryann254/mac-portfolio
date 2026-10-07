'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import { useEffect } from 'react'
import type { Panel } from './panels'
import { useSystem } from './system-store'
import { useWindows } from './window-store'

/**
 * Whichever panel is up, and the three things every one of them does the same:
 * close on Escape, close when the reader presses the desktop behind it, and
 * close when a window comes up in front of it.
 *
 * Each one loads when it is first opened, like the app windows do, so none of
 * the five is on the first load. The layer itself sits under the menu bar and
 * the dock, which is where macOS leaves them: Launchpad covers the desktop and
 * the dock is still there to be used.
 */
type Part = ComponentType

const PANELS: Record<Panel, { readonly name: string; readonly Body: Part }> = {
  apple: {
    name: 'the Apple menu',
    Body: dynamic(() => import('./apple-menu').then((m) => m.AppleMenu)),
  },
  spotlight: {
    name: 'Spotlight',
    Body: dynamic(() => import('./spotlight').then((m) => m.Spotlight)),
  },
  launchpad: {
    name: 'Launchpad',
    Body: dynamic(() => import('./launchpad').then((m) => m.Launchpad)),
  },
  'control-centre': {
    name: 'Control Centre',
    Body: dynamic(() => import('./control-centre').then((m) => m.ControlCentre)),
  },
  about: {
    name: 'About This Site',
    Body: dynamic(() => import('./about-this-site').then((m) => m.AboutThisSite)),
  },
}

export function PanelLayer() {
  const panel = useSystem((store) => store.panel)
  const closePanel = useSystem((store) => store.closePanel)
  const togglePanel = useSystem((store) => store.togglePanel)

  /* Cmd+K is the one key that opens a panel rather than closing one, so it
     listens whether or not anything is up. Ctrl+K as well, because this site is
     a Mac drawn on whatever machine the reader actually has. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
      event.preventDefault()
      togglePanel('spotlight')
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [togglePanel])

  useEffect(() => {
    if (panel === undefined) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePanel()
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [panel, closePanel])

  /* The keyboard goes into the panel and comes back out to whatever opened it,
     so Escape leaves the reader on the Apple logo rather than at the top of the
     page. Each panel focuses its own first control on the way in. */
  useEffect(() => {
    if (panel === undefined) return
    const opener = document.activeElement
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [panel])

  /* A window coming up puts the desktop in front, so the panel it was opened
     from has done its job. One rule covers every door into a window: Spotlight,
     Launchpad, the dock, a folder on the desktop, and the address bar. */
  useEffect(
    () =>
      useWindows.subscribe((now, before) => {
        if (now.stack !== before.stack) useSystem.getState().closePanel()
      }),
    [],
  )

  if (panel === undefined) return null
  const { name, Body } = PANELS[panel]

  return (
    <>
      <button
        type="button"
        data-testid="panel-backdrop"
        aria-label={`Close ${name}`}
        onClick={closePanel}
        className="absolute inset-0 z-[73] cursor-default"
      />
      {/* The box the panel positions itself in. It takes no pointer events of
          its own, so a press that lands anywhere the panel has not drawn goes
          through to the backdrop behind it and closes the thing. */}
      <div data-testid="panel" className="pointer-events-none absolute inset-0 z-[74]">
        <Body />
      </div>
    </>
  )
}
