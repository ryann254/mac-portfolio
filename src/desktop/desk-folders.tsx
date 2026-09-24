import Link from 'next/link'

/**
 * The folders sitting on the desktop, top left. They are the way into the
 * content until phase 6 gives Finder a real file tree, at which point the same
 * four open Finder at that location instead of loading a page.
 *
 * The labels carry their own backdrop, which macOS does not. White text on the
 * pale half of this wallpaper measures 2.6:1, and a text shadow is not enough
 * to fix that; `tests/contrast.spec.ts` reads the pixels and holds it to 4.5.
 */
const folders = [
  { label: 'Intro', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Work Experience', href: '/experience' },
  { label: 'Contacts', href: '/contact' },
] as const

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
  return (
    <nav aria-label="Desktop" className="absolute top-[38px] left-5 z-10">
      <ul className="flex flex-col gap-1" role="list">
        {folders.map((folder) => (
          <li key={folder.href}>
            <Link
              href={folder.href}
              className="flex w-[124px] flex-col items-center gap-1 rounded-[9px] px-1 pt-2 pb-1.5 text-[12.5px] text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-[-2px]"
            >
              <FolderIcon />
              <span
                data-testid="folder-label"
                className="rounded bg-black/35 px-1.5 [text-shadow:0_1px_4px_rgba(0,0,0,0.55)]"
              >
                {folder.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
