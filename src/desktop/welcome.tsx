import { profile } from '@/content'

/**
 * The only content on the desktop itself, and the element Lighthouse measures
 * as the largest contentful paint. The scrim behind it is not decoration: white
 * text has to clear 4.5:1 over whatever wallpaper is behind it, and the reader
 * gets to change the wallpaper from phase 8 on. `tests/contrast.spec.ts` reads
 * the rendered pixels to prove it.
 *
 * It sits lower on a phone, where the desktop folders reach further down the
 * screen and the two used to print on top of each other.
 */
export function Welcome() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[46%] z-10 sm:top-[24%] flex flex-col items-center px-6 text-center text-white">
      <div
        aria-hidden
        className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-[620px] w-[1240px] bg-[radial-gradient(closest-side,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.36)_32%,rgba(0,0,0,0.16)_66%,transparent_100%)]"
      />
      <h1 className="relative font-semibold text-4xl tracking-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.4),0_2px_22px_rgba(0,0,0,0.35)] sm:text-5xl lg:text-6xl">
        {profile.name}
      </h1>
      <p
        data-testid="welcome-role"
        className="relative mt-1.5 font-medium text-base [text-shadow:0_1px_3px_rgba(0,0,0,0.4)] sm:text-lg"
      >
        {profile.headline}
      </p>
      <p
        data-testid="welcome-tagline"
        className="relative mt-3.5 max-w-[54ch] text-sm/relaxed opacity-95 [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] sm:text-[15px]"
      >
        {profile.tagline}
      </p>
    </div>
  )
}
