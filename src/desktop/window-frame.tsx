'use client'

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { AppBody, AppChrome } from './app-window'
import type { AppId } from './apps'
import { windowTitle } from './routes'
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
/**
 * Moves the keyboard into an open window. The dock calls it after opening an
 * app, for the one case the effect above cannot see: pressing the icon of the
 * window that is already in front changes nothing, so nothing re-renders and
 * the keyboard would be left on the icon. The selector and the attribute it
 * reads live in the same file on purpose.
 */
export const putKeyboardIn = (id: AppId): void => {
  document.querySelector<HTMLElement>(`[data-window="${id}"]`)?.focus()
}

type Gesture = {
  readonly pointerId: number
  readonly from: { readonly x: number; readonly y: number }
  readonly start: Bounds
  /** Which edge is being pulled. Absent means the window is being dragged whole. */
  readonly handle?: Handle
}

/** macOS drains the colour out of the three buttons on a window that is not in front. */
const DIMMED = 'bg-black/20 dark:bg-white/25'

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
  z,
  focused,
}: {
  state: WindowState
  /** How far up the stack this window is. The layer works it out. */
  z: number
  focused: boolean
}) {
  /* macOS titles a Finder window after the folder it is in rather than after
     Finder, and Safari after the page rather than after Safari. */
  const target = { app: state.id, showing: state.showing }
  const title = windowTitle(target)
  const { focus, close, minimize, toggleMaximized, place } = useWindows.getState()
  const root = useRef<HTMLElement>(null)
  const [gesture, setGesture] = useState<Gesture | undefined>(undefined)
  const [live, setLive] = useState<Bounds | undefined>(undefined)
  const bounds = live ?? state.bounds
  /* A phone has no window manager: every window is the screen. One truth for
     the box it is drawn in, the gestures it answers, and the handles it wears,
     rather than three places each asking the width again. */
  const phone = useWindows((store) => store.phone)
  const full = state.maximized || phone

  /* Where this window shrinks to when it is minimised: its own icon in the
     dock. Measured at the moment it is minimised rather than kept anywhere,
     because it is a fact about the screen right now, and the dock moves when
     the window does not.

     Before paint, so the properties and `data-minimized` land in the same frame
     and the transition has somewhere to go. A dock icon the phone layout has
     hidden measures zero, and a window aimed at that would fly into the top
     left corner, so it falls back to the middle of the bottom edge, which is
     where the dock is. */
  useLayoutEffect(() => {
    const frame = root.current
    if (!frame || !state.minimized) return

    /* This reads the window at full size because the properties below default
       to the transform that does nothing, and it forces the style resolution
       that gives the transition somewhere to start from. */
    const box = frame.getBoundingClientRect()
    const icon = document.querySelector(`[data-dock-item="${state.id}"]`)?.getBoundingClientRect()
    const into =
      icon && icon.width > 0
        ? { x: icon.left + icon.width / 2, y: icon.top + icon.height / 2, size: icon.width }
        : { x: globalThis.innerWidth / 2, y: globalThis.innerHeight, size: 48 }

    frame.style.setProperty('--into-x', `${into.x - (box.left + box.width / 2)}px`)
    frame.style.setProperty('--into-y', `${into.y - (box.top + box.height / 2)}px`)
    frame.style.setProperty('--into-scale', `${into.size / Math.max(box.width, 1)}`)
  }, [state.minimized, state.id])

  /* The keyboard follows the front window. Opening one puts the keyboard in it,
     which is the whole of the keyboard path: tab to the dock, press Enter, and
     you are inside. Closing or minimising the front window hands the front to
     the one underneath, and without this the keyboard would be left on a
     control that no longer exists, where Escape closes nothing. */
  useEffect(() => {
    if (focused) root.current?.focus()
  }, [focused])

  const begin = (event: ReactPointerEvent, handle?: Handle) => {
    if (full) return
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

  /**
   * Where the gesture has got to. Read from the event rather than from state,
   * so letting go in the same frame as the last move still commits the
   * rectangle the pointer is actually on rather than the one before it.
   */
  const reach = (event: ReactPointerEvent, at: Gesture): Bounds => {
    const dx = event.clientX - at.from.x
    const dy = event.clientY - at.from.y
    const screen = viewport()
    return at.handle
      ? resizeBy(at.handle, at.start, dx, dy, screen)
      : moveBy(at.start, dx, dy, screen)
  }

  const track = (event: ReactPointerEvent) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return
    setLive(reach(event, gesture))
  }

  const settle = (event: ReactPointerEvent) => {
    if (!gesture || event.pointerId !== gesture.pointerId) return
    place(state.id, reach(event, gesture))
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
      aria-label={title}
      data-window={state.id}
      data-testid="window"
      data-focused={focused ? '' : undefined}
      data-dragging={gesture ? '' : undefined}
      data-minimized={state.minimized ? '' : undefined}
      onPointerDown={() => focus(state.id)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') close(state.id)
      }}
      style={{ ...frameBox(bounds, full), zIndex: z }}
      className="pointer-events-auto absolute flex flex-col overflow-hidden rounded-[10px] border-[0.5px] border-black/25 bg-white/85 max-md:rounded-none max-md:border-0 max-md:bg-white max-md:shadow-none shadow-[0_18px_50px_rgba(0,0,0,0.3)] outline-none backdrop-blur-2xl backdrop-saturate-150 focus-visible:ring-2 focus-visible:ring-sky-500/70 data-[focused]:shadow-[0_26px_70px_rgba(0,0,0,0.42)] dark:border-white/15 dark:bg-zinc-800/85 max-md:dark:bg-zinc-900"
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
        {/* The three lights are a pointer's controls at a pointer's size. A
            phone gets Done instead: a window there fills the screen, so there
            is nothing to resize and nowhere to minimise it to. */}
        <div className="relative hidden items-center gap-2 pl-3 md:flex">
          <Light
            label={`Close ${title}`}
            colour={focused ? 'bg-[#ff5f57]' : DIMMED}
            onClick={() => close(state.id)}
          />
          <Light
            label={`Minimise ${title}`}
            colour={focused ? 'bg-[#febc2e]' : DIMMED}
            onClick={() => minimize(state.id)}
          />
          <Light
            label={state.maximized ? `Restore ${title}` : `Maximise ${title}`}
            colour={focused ? 'bg-[#28c840]' : DIMMED}
            onClick={() => toggleMaximized(state.id)}
          />
        </div>
        <AppChrome target={target} title={title} />
        <button
          type="button"
          data-done
          onClick={() => close(state.id)}
          className="relative z-10 ml-auto mr-1 flex h-9 items-center rounded-lg px-3 font-medium text-[14px] text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 focus-visible:outline-offset-[-2px] md:hidden dark:text-sky-400"
        >
          Done
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <AppBody target={target} />
      </div>

      {!full &&
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
 * one stays mounted and keeps its box, because an app that has loaded a
 * document should not have to load it again to come back from the dock, and
 * because a window with no box has nowhere to shrink from.
 */
const frameBox = (bounds: Bounds, full: boolean): CSSProperties => {
  /* A minimised window keeps its box. It is still laid out where it was, so it
     has somewhere to shrink from, and `globals.css` takes it out of the page
     with `visibility` once the shrink is over. */
  if (full) return { top: MENU_BAR, right: 0, bottom: 0, left: 0 }
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
