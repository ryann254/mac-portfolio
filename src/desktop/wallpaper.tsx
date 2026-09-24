/**
 * Monterey, drawn. Apple ships this as a 380 kB photograph of a gradient; the
 * same picture as SVG is under 3 kB and scales to any window. It has to be
 * inline SVG rather than a CSS gradient because phase 0 proved a CSS gradient
 * never counts as a contentful paint, and Lighthouse then refuses to score
 * performance at all.
 *
 * Day and night are the same paths with a different palette, which lives in
 * `globals.css` as the `--wall-*` properties.
 *
 * It crops like a real wallpaper rather than squashing. Stretching a 16:10
 * composition into a phone dragged the pale band across the welcome text and
 * took the contrast under 3:1.
 */
const stops = (
  name: string,
  count: number,
  offsets: readonly number[],
  opacities?: readonly string[],
) =>
  Array.from({ length: count }, (_, i) => (
    <stop
      key={offsets[i]}
      offset={offsets[i]}
      stopColor={`var(--wall-${name}-${i + 1})`}
      stopOpacity={opacities?.[i]}
    />
  ))

export function Wallpaper() {
  return (
    <svg
      data-testid="wallpaper"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
    >
      <defs>
        <linearGradient id="wall-base" x1=".2" y1="1" x2=".55" y2="0">
          {stops('base', 4, [0, 0.38, 0.72, 1])}
        </linearGradient>
        <linearGradient id="wall-left" x1=".1" y1="1" x2=".62" y2="0">
          {stops('left', 4, [0, 0.34, 0.7, 1])}
        </linearGradient>
        <linearGradient id="wall-ridge" x1=".1" y1="1" x2=".5" y2=".15">
          {stops('ridge', 3, [0, 0.5, 1])}
        </linearGradient>
        <linearGradient id="wall-right" x1="1" y1="0" x2=".2" y2="1">
          {stops('right', 4, [0, 0.34, 0.7, 1])}
        </linearGradient>
        <linearGradient id="wall-haze" x1=".5" y1="0" x2=".5" y2="1">
          {stops('haze', 4, [0, 0.32, 0.64, 1], ['.95', '.82', '.46', '0'])}
        </linearGradient>
        <linearGradient id="wall-mist" x1=".45" y1="0" x2=".55" y2="1">
          {stops('mist', 3, [0, 0.5, 1], ['.8', '.4', '0'])}
        </linearGradient>
        <linearGradient id="wall-glow" x1=".45" y1="1" x2=".52" y2=".1">
          <stop offset="0" stopColor="var(--wall-glow)" stopOpacity=".92" />
          <stop offset="1" stopColor="var(--wall-glow)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#wall-base)" />
      <path
        d="M1440 0 L1440 900 L760 900 C 800 646 884 400 1020 222 C 1128 82 1272 4 1440 0 Z"
        fill="url(#wall-right)"
        opacity=".92"
      />
      <path
        d="M0 0 L0 900 L560 900 C 524 640 448 398 340 234 C 248 96 132 20 0 0 Z"
        fill="url(#wall-left)"
      />
      <path
        d="M0 214 L0 900 L378 900 C 346 656 280 460 192 326 C 134 240 66 200 0 214 Z"
        fill="url(#wall-ridge)"
      />
      <path
        d="M640 0 L1440 0 L1440 222 C 1330 252 1232 300 1152 354 C 1076 406 1016 456 976 500 C 906 402 818 262 736 148 C 700 98 664 48 640 0 Z"
        fill="url(#wall-haze)"
      />
      <path
        d="M800 0 L1330 0 L1440 92 C 1330 122 1236 176 1152 236 C 1080 288 1026 336 990 376 C 934 296 872 200 824 116 C 812 78 802 38 800 0 Z"
        fill="url(#wall-mist)"
      />
      <path
        d="M0 900 L600 900 C 528 744 384 618 208 578 C 122 558 50 556 0 562 Z"
        fill="url(#wall-glow)"
      />
    </svg>
  )
}
