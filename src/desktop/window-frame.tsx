'use client'

import { type PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from 'react'
import { appById } from './apps'
import { PlaceholderApp } from './placeholder-app'
import {
  type Bounds,
  type Handle,
  handles,
  MENU_BAR,
  moveBy,
  resizeBy,
  TITLE_BAR,
} from './window-bounds'
import type { WindowState } from './window-state'
import { useWindows, viewport } from './window-store'

/**
 * One window: the chrome, the drag, the eight resize handles, and the three
 * buttons. Every gesture is a pointer event, so a finger on a tablet works the
 * same as a mouse.
 *
 * While the pointer is down the live rectangle sits in this component rather
 * than in the store. That keeps a drag to one re-render a frame, and it means
 * the store only ever sees rectangles a reader stopped on.
 */
type Gesture = {
  readonly pointerId: number
  readonly from: { readonly x: number; readonly y: number }
  readonly start: Bounds
  /** Which edge is being pulled. Absent means the window is being dragged whole. */
  readonly handle?: Handle
}

/** Where each handle sits on the frame, and the cursor that says what it does. */
const HANDLE_STYLE: Record<Handle, string> = {
  n: 'top-0 inset-x-3 h-1.5 cursor-ns-resize',
  s: 'bottom-0 inset-x-3 h-1.5 cursor-ns-resize',
  e: 'right-0 inset-y-3 w-1.5 cursor-ew-resize',
  w: 'left-0 inset-y-3 w-1.5 cursor-ew-resize',
  ne: 'top-0 right-0 size-3 cursor-nesw-resize',
  nw: 'top-0 left-0 size-3 cursor-nwse-resize',
  se: 'bottom-0 right-0 size-3 cursor-nwse-resize',
  sw: 'bottom-0 left-0 size-3 cursor-nesw-resize',
}

export function WindowFrame({
  state,
  index,
  focused,
}: {
  state: WindowState
  index: number
  focused: boolean
}) {
  const app = appById(state.id)
  const { focus, close, minimize, toggleMaximized, place } = useWindows.getState()
  const root = useRef<HTMLElement>(null)
  const [gesture, setGesture] = useState<Gesture | undefined>(undefined)
  const [live, setLive] = useState<Bounds | undefined>(undefined)
  const bounds = live ?? state.bounds

  // Opening a window puts the keyboard in it, which is the whole of the
  // keyboard path: tab to the dock, press Enter, and you are inside.
  useEffect(() => {
    root.current?.focus()
  }, [])

  const begin = (event: ReactPointerEvent, handle?: Handle) => {
    if (state.maximized) return
    /* The element the reader pressed keeps the pointer, so the gesture survives
       the pointer leaving the window, and the double click that zooms still
       lands on the title bar. Capturing on the frame instead would retarget
       that click to the frame and the zoom would never fire.

       No preventDefault either. It would stop the same double click, and stop
       the browser moving focus into the frame on a press, which is what makes
       Escape work after a click. Text selection during a drag is held off in
       CSS instead. */
    event.currentTarget.setPointerCapture(event.pointerId)
    setGesture({
      pointerId: event.pointerId,
      from: { x: event.clientX, y: event.clientY },
      start: state.bounds,
      handle,
    })
  }

  const track = (event: ReactPointerEvent) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return
    const dx = event.clientX - gesture.from.x
    const dy = event.clientY - gesture.from.y
    const screen = viewport()
    setLive(
      gesture.handle
        ? resizeBy(gesture.handle, gesture.start, dx, dy, screen)
        : moveBy(gesture.start, dx, dy, screen),
    )
  }

  const settle = () => {
    if (!gesture) return
    if (live) place(state.id, live)
    setGesture(undefined)
    setLive(undefined)
  }

  /** The four handlers every drag surface needs: the title bar and the eight edges. */
  const pulls = (handle?: Handle) => ({
    onPointerDown: (event: ReactPointerEvent) => begin(event, handle),
    onPointerMove: track,
    onPointerUp: settle,
    onLostPointerCapture: settle,
  })

  return (
    <section
      ref={root}
      tabIndex={-1}
      aria-label={app.name}
      data-window={state.id}
      data-testid="window"
      data-focused={focused ? '' : undefined}
      data-dragging={gesture ? '' : undefined}
      onPointerDown={() => focus(state.id)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close(state.id)
      }}
      style={{ ...frameBox(state, bounds), zIndex: index + 1 }}
      className="pointer-events-auto absolute flex flex-col overflow-hidden rounded-[10px] border-[0.5px] border-black/25 bg-white/85 shadow-[0_18px_50px_rgba(0,0,0,0.3)] outline-none backdrop-blur-2xl backdrop-saturate-150 focus-visible:ring-2 focus-visible:ring-sky-500/70 data-[focused]:shadow-[0_26px_70px_rgba(0,0,0,0.42)] dark:border-white/15 dark:bg-zinc-800/85"
    >
      <header
        className="relative flex shrink-0 items-center border-black/10 border-b bg-zinc-100/70 dark:border-white/10 dark:bg-zinc-900/60"
        style={{ height: TITLE_BAR }}
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: a title bar is a
            pointer gesture with no ARIA role to claim, and every move it makes
            is reachable another way: the three buttons and Escape are real
            buttons and a real key, and phase 9 drops windows on touch. */}
        <div
          data-testid="title-bar"
          className="absolute inset-0 cursor-default touch-none"
          onDoubleClick={() => toggleMaximized(state.id)}
          {...pulls()}
        />
        <div className="relative flex items-center gap-2 pl-3">
          <Light
            label={`Close ${app.name}`}
            colour="bg-[#ff5f57]"
            onClick={() => close(state.id)}
          />
          <Light
            label={`Minimise ${app.name}`}
            colour="bg-[#febc2e]"
            onClick={() => minimize(state.id)}
          />
          <Light
            label={state.maximized ? `Restore ${app.name}` : `Maximise ${app.name}`}
            colour="bg-[#28c840]"
            onClick={() => toggleMaximized(state.id)}
          />
        </div>
        <span className="-translate-x-1/2 pointer-events-none absolute left-1/2 font-medium text-[13px] text-zinc-700 dark:text-zinc-200">
          {app.name}
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        <PlaceholderApp app={app} />
      </div>

      {!state.maximized &&
        handles.map((handle) => (
          <div
            key={handle}
            aria-hidden="true"
            data-handle={handle}
            className={`absolute touch-none ${HANDLE_STYLE[handle]}`}
            {...pulls(handle)}
          />
        ))}
    </section>
  )
}

/**
 * A maximised window is drawn against the desktop's own edges, so it needs no
 * stored rectangle and restoring puts it back exactly where it was. A minimised
 * one stays mounted, because an app that has loaded a document should not have
 * to load it again to come back from the dock.
 */
const frameBox = (state: WindowState, bounds: Bounds) => {
  if (state.minimized) return { display: 'none' }
  if (state.maximized) return { top: MENU_BAR, right: 0, bottom: 0, left: 0 }
  return { top: bounds.y, left: bounds.x, width: bounds.width, height: bounds.height }
}

const Light = ({
  label,
  colour,
  onClick,
}: {
  label: string
  colour: string
  onClick: () => void
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={`size-3 rounded-full border-[0.5px] border-black/15 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-2 ${colour}`}
  />
)
