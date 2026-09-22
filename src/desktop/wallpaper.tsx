/**
 * Inline SVG rather than a CSS background or an image file: it paints on the
 * first frame with no extra request, and unlike a background gradient it counts
 * as contentful paint, which is what Lighthouse measures. Phase 1 swaps in the
 * real macOS wallpapers.
 */
export function Wallpaper() {
  return (
    <svg
      data-testid="wallpaper"
      role="img"
      aria-labelledby="wallpaper-title"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
    >
      <title id="wallpaper-title">A desktop wallpaper of a blue sky over warm sand</title>
      <defs>
        <radialGradient id="sky" cx="18%" cy="8%" r="118%">
          <stop offset="0%" stopColor="var(--color-desk-haze)" />
          <stop offset="38%" stopColor="var(--color-desk-sky)" />
          <stop offset="78%" stopColor="var(--color-desk-dusk)" />
          <stop offset="100%" stopColor="var(--color-desk-night)" />
        </radialGradient>
        <linearGradient id="sand" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--color-desk-sand)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--color-desk-sand)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill="url(#sky)" />
      <rect y="66" width="100" height="34" fill="url(#sand)" className="dark:hidden" />
    </svg>
  )
}
