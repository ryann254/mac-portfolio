'use client'

import type { Target } from './routes'
import { putKeyboardIn } from './window-frame'
import { useWindows } from './window-store'

/**
 * The folders sitting on the desktop, top left. They open the same windows the
 * dock does, at a folder rather than at the app, which is what a folder on a
 * real desktop does. Phase 6 gives Finder the file tree behind them.
 *
 * The labels carry their own backdrop, which macOS does not. White text on the
 * pale half of this wallpaper measures 2.6:1, and a text shadow is not enough
 * to fix that; `tests/contrast.spec.ts` reads the pixels and holds it to 4.5.
 */
const folders: readonly { readonly label: string; readonly target: Target }[] = [
  { label: 'Intro', target: { app: 'finder', showing: 'about' } },
  { label: 'Projects', target: { app: 'finder', showing: 'projects' } },
  { label: 'Work Experience', target: { app: 'finder', showing: 'experience' } },
  { label: 'Contacts', target: { app: 'contact' } },
]

export function FolderIcon() {
  return (
    <svg viewBox="0 0 64 52" aria-hidden="true" className="h-[47px] w-[58px] drop-shadow-sm">
      <path
        d="M2 9a6 6 0 0 1 6-6h13l6 6h29a6 6 0 0 1 6 6v29a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z"
        fill="#3aa7ea"
      />
      <path
        d="M2 15a6 6 0 0 1 6-6h48a6 6 0 0 1 6 6v29a6 6 0 0 1-6 6H8a6 6 0 0 1-6-6z"
        fill="#69c6f7"
      />
    </svg>
  )
}

export function DeskFolders() {
  const open = useWindows((store) => store.open)

  return (
    <nav aria-label="Desktop" className="absolute top-[38px] left-5 z-10">
      <ul className="flex flex-col gap-1" role="list">
        {folders.map((folder) => (
          <li key={folder.label}>
            <button
              type="button"
              onClick={() => {
                open(folder.target)
                putKeyboardIn(folder.target.app)
              }}
              className="flex w-[124px] flex-col items-center gap-1 rounded-[9px] px-1 pt-2 pb-1.5 text-[12.5px] text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[-2px]"
            >
              <FolderIcon />
              <span
                data-testid="folder-label"
                className="rounded bg-black/35 px-1.5 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]"
              >
                {folder.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
