/**
 * The one piece of content on the desktop itself. It is also what gives the
 * page a largest contentful paint, which Lighthouse needs before it will score
 * performance at all. Phase 3 places and animates it properly.
 *
 * The scrim is not decoration. White text has to stay readable over whatever
 * wallpaper is behind it, and phase 1 swaps this one for Apple's, whose colours
 * we do not pick. At 60% it clears 4.5:1 even over a pure white wallpaper, so
 * the guarantee belongs to the text rather than to any particular background.
 */
export function Welcome() {
  return (
    <div className="absolute inset-x-0 top-[38%] flex justify-center px-6">
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
      </div>
    </div>
  )
}
