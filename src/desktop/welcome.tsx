import Link from 'next/link'

/**
 * The one piece of content on the desktop itself. It is also what gives the
 * page a largest contentful paint, which Lighthouse needs before it will score
 * performance at all. Phase 3 places and animates it properly.
 *
 * The scrim is not decoration. White text has to stay readable over whatever
 * wallpaper is behind it, and phase 1 swaps this one for Apple's, whose colours
 * we do not pick. At 60% it clears 4.5:1 even over a pure white wallpaper, so
 * the guarantee belongs to the text rather than to any particular background.
 *
 * The links are scaffolding. Until the dock exists in phase 3, they are the
 * only way into the content, and a page nobody can reach cannot be reviewed.
 */
const sections = [
  { href: '/about', label: 'About' },
  { href: '/experience', label: 'Experience' },
  { href: '/projects', label: 'Projects' },
  { href: '/skills', label: 'Skills' },
  { href: '/contact', label: 'Contact' },
]

export function Welcome() {
  return (
    <div className="absolute inset-x-0 top-[34%] flex justify-center px-6">
      <div className="relative flex flex-col items-center gap-2 px-16 py-10 text-center">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(closest-side,rgba(0,0,0,0.6)_0%,rgba(0,0,0,0.6)_58%,transparent_100%)]"
        />
        <h1 className="relative text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Ryan Waweru
        </h1>
        <p className="relative text-base font-medium text-white sm:text-lg">
          Senior Frontend Engineer
        </p>
        <nav className="relative mt-4" aria-label="Sections">
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2" role="list">
            {sections.map((section) => (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className="rounded-sm text-sm text-white underline underline-offset-4 hover:no-underline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-4"
                >
                  {section.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
