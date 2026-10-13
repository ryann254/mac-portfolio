'use client'

/**
 * What a reader sees if the page itself fails to render. Next ships one of
 * these already, and it was the only screen on the site nobody here had
 * written: "This page couldn't load. A server error occurred. Reload to try
 * again," in a voice that belongs to the framework. The copy check over the
 * built HTML is what turned it up.
 *
 * The root layout is gone by the time this renders, so this carries its own
 * document and its own colours. No Tailwind, no font, no wallpaper: the one
 * thing it has to do is work when the rest of the page could not.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en" style={{ colorScheme: 'light dark' }}>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          background: 'light-dark(#f4f4f5, #18181b)',
          color: 'light-dark(#27272a, #f4f4f5)',
          font: '15px/1.55 ui-sans-serif, system-ui, -apple-system, sans-serif',
        }}
      >
        <main style={{ maxWidth: '30rem', textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '19px', fontWeight: 600 }}>
            The desktop did not come up
          </h1>
          <p style={{ color: 'light-dark(#52525b, #a1a1aa)' }}>
            Something broke on the way to this page. Try it again. If this screen is all you can
            get, the CV is a plain file at{' '}
            <a href="/resume.pdf" style={{ color: 'inherit' }}>
              /resume.pdf
            </a>{' '}
            and it will load on its own.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              font: 'inherit',
              cursor: 'pointer',
              borderRadius: '8px',
              border: '0.5px solid light-dark(rgba(0,0,0,0.15), rgba(255,255,255,0.15))',
              background: 'light-dark(rgba(0,0,0,0.05), rgba(255,255,255,0.1))',
              color: 'inherit',
              padding: '6px 16px',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
