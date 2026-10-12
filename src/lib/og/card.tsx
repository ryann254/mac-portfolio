import { readFile } from 'node:fs/promises'
import { ImageResponse } from 'next/og'
import { profile } from '@/content'

/**
 * The picture a shared link shows. One card, four route files calling it, so
 * what a preview looks like is decided here and each route only says what it is
 * about.
 *
 * It is drawn rather than screenshotted. A screenshot of the desktop would be a
 * window a reader cannot read at the size a link preview is shown, and every
 * route would need a browser run to produce one.
 */

/** What every link preview is, by convention and by what the crawlers crop to. */
export const CARD = { width: 1200, height: 630 } as const

export const contentType = 'image/png'

/**
 * Monterey's day palette, the wallpaper the site opens on, written out rather
 * than read from `globals.css`: this runs in a build step with no stylesheet
 * and no `light-dark()` to resolve.
 */
const WALL = {
  from: '#7a24e8',
  through: '#c866c9',
  to: '#f2cfe4',
} as const

/**
 * One weight. A card carries a title and a line under it, and size, colour and
 * opacity separate those two without a second font. `pnpm og-font` fetches it,
 * and it never reaches a reader: it is read while the build draws the PNGs.
 *
 * Read off disk rather than fetched. Every card here is prerendered, so this
 * runs at build time in Node, where `fetch` refuses a `file:` URL outright.
 */
const font = (): Promise<Buffer> => readFile(new URL('./inter-600.woff', import.meta.url))

/**
 * @param title what this address opens, which is the window's own name
 * @param detail the one line under it, or nothing for the desktop itself
 */
export async function cardFor(title: string, detail?: string): Promise<ImageResponse> {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 96px',
        color: 'white',
        backgroundImage: `linear-gradient(135deg, ${WALL.from} 0%, ${WALL.through} 62%, ${WALL.to} 100%)`,
      }}
    >
      {/* A scrim, because the pale end of this wallpaper is what the last
          third of the card is painted in and white has to stay readable on it. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          backgroundImage:
            'linear-gradient(100deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.34) 55%, rgba(0,0,0,0.18) 100%)',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ display: 'flex', fontSize: 76, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
          {title}
        </div>
        {detail && (
          <div
            style={{ display: 'flex', fontSize: 34, marginTop: 20, opacity: 0.86, lineHeight: 1.3 }}
          >
            {detail}
          </div>
        )}
        <div style={{ display: 'flex', fontSize: 28, marginTop: 56, opacity: 0.82 }}>
          {profile.name} · {profile.headline}
        </div>
      </div>
    </div>,
    {
      ...CARD,
      fonts: [{ name: 'Inter', data: await font(), weight: 600, style: 'normal' }],
    },
  )
}
