import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import { BOOTED_KEY } from '@/desktop/boot-state'
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

/**
 * Runs before the first paint. The boot markup is in the server response so it
 * paints without waiting for JavaScript, which also means a reload would flash
 * it before React could say otherwise. This hides it in the same tick instead.
 */
const skipBootScript = `try{if(sessionStorage.getItem(${JSON.stringify(BOOTED_KEY)})==='yes')document.documentElement.dataset.booted=''}catch(e){}`

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
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: a fixed string
            with no input in it, and it has to run before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: skipBootScript }} />
      </head>
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
