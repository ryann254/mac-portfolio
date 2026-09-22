/**
 * The one piece of content on the desktop itself. It is also what gives the
 * page a largest contentful paint, which Lighthouse needs before it will score
 * performance at all. Phase 3 places and animates it properly.
 */
export function Welcome() {
  return (
    <div className="absolute inset-x-0 top-[38%] flex flex-col items-center gap-2 px-6 text-center text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.45)]">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Ryan Waweru</h1>
      <p className="text-base font-medium text-white/85 sm:text-lg">Senior Frontend Engineer</p>
    </div>
  )
}
