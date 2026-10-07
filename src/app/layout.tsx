import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { APPEARANCE_SCRIPT } from '@/desktop/appearance'
import { Desktop } from '@/desktop/desktop'
import { SKIP_BOOT_SCRIPT } from '@/desktop/system-state'
import './globals.css'

/**
 * One variable file, Latin only, 48 kB for every weight. macOS uses SF Pro,
 * which Apple does not license for the web, and the system stack turns into
 * Segoe or DejaVu off a Mac, which gives the whole illusion away.
 */
const inter = localFont({
  src: '../../public/fonts/inter-latin.woff2',
  variable: '--font-inter',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ryan Waweru, Senior Frontend Engineer',
  description:
    'The portfolio of Ryan Waweru, a senior frontend engineer in Nairobi, built as a macOS desktop.',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#9b31d8' },
    { media: '(prefers-color-scheme: dark)', color: '#250860' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Two fixed strings, and both have to run before the first paint: one
            hides the boot a reader has already watched, the other puts back the
            theme, wallpaper, and brightness they chose last time. */}
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: fixed strings
            with no input in them, and they have to run before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: `${SKIP_BOOT_SCRIPT}${APPEARANCE_SCRIPT}` }} />
      </head>
      <body className="h-full overflow-hidden">
        <Desktop>{children}</Desktop>
      </body>
    </html>
  )
}
