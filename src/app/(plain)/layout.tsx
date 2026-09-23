import Link from 'next/link'
import type { ReactNode } from 'react'
import { profile } from '@/content'

/**
 * Temporary chrome. Phase 3 puts this content inside real windows, and these
 * routes exist now only so the content can be read and tested before then.
 */
const sections = [
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/projects', label: 'Projects' },
  { href: '/skills', label: 'Skills' },
  { href: '/contact', label: 'Contact' },
]

export default function PlainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full overflow-y-auto bg-white text-zinc-900">
      <header className="border-zinc-200 border-b">
        <nav className="mx-auto flex max-w-3xl flex-wrap items-baseline gap-x-6 gap-y-2 px-6 py-5">
          <Link href="/" className="font-semibold tracking-tight">
            {profile.name}
          </Link>
          <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" role="list">
            {sections.map((section) => (
              <li key={section.href}>
                <Link href={section.href} className="text-zinc-600 hover:text-zinc-900">
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
    </div>
  )
}
