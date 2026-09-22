import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ryan Waweru, Senior Frontend Engineer',
  description:
    'The portfolio of Ryan Waweru, a senior frontend engineer in Nairobi, built as a macOS desktop.',
}

export const viewport: Viewport = {
  themeColor: '#1c2d52',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  )
}
