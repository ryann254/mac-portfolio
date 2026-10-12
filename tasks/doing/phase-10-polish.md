---
status: review
owner: claude
files:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/app/sitemap.ts
  - src/app/robots.ts
  - src/app/opengraph-image.tsx
  - src/app/[app]/opengraph-image.tsx
  - src/app/finder/opengraph-image.tsx
  - src/app/finder/[location]/opengraph-image.tsx
  - src/app/safari/opengraph-image.tsx
  - src/app/safari/[slug]/opengraph-image.tsx
  - src/lib/og/
  - src/lib/site.ts
  - src/desktop/window-frame.tsx
  - src/desktop/dock.tsx
  - scripts/fetch-og-font.ts
  - tests/motion.spec.ts
  - tests/sharing.spec.ts
pr: https://github.com/ryann254/mac-portfolio/pull/14
---
Problem: Minimize jumps instead of animating, shared links have no preview image, and nothing proves reduced motion turns every animation off.
Fix: Animate minimize into the dock, audit every animation against reduced motion, and generate an Open Graph image per route with the sitemap and robots files. Add typed Terminal commands if the budget allows.
Done when:
- With reduced motion set, no animation or transition on the page has a non-zero duration.
- Every route returns a preview image and appears in the sitemap.
- The bundle size check still passes.
Out of scope: New apps or new content.

## Turn-in

Done when, line by line:

- With reduced motion set, no animation or transition on the page has a
  non-zero duration. `tests/motion.spec.ts` walks every element on the desktop,
  in every app, in a panel and in a window Finder opened, and nothing failed on
  the first run: the rule was already kept everywhere, and now something holds
  it there. One animation keeps a duration, the boot bar, because its
  `animationend` is what ends the boot; the same spec reads its keyframes off
  the stylesheet to prove they hold the bar still. A sweep with motion on is in
  there too, so a bug that stopped the walker seeing anything cannot leave the
  other tests passing on an empty list.
- Every route returns a preview image and appears in the sitemap.
  `tests/sharing.spec.ts` is one test per address, sixteen of them, and the
  sitemap is compared against the registry's own list rather than a copy.
- The bundle size check still passes: 321.0 kB of 600 transferred, 163.2 kB of
  230 JavaScript, up 4.2 kB and 2.9 kB from main.

Minimising was the third part of the Fix and is in. It shrinks into the
window's own dock icon rather than vanishing, and comes back out of it.

Gates: `pnpm fix`, `pnpm typecheck`, `pnpm check` clean, roast on Fable 5.1,
232 unit tests, 207 browser tests (95 skipped), `pnpm routes` clean.

Evidence in `evidence/phase-10`: a filmstrip of a window going into the dock and
coming back, and the cards for the desktop, Finder, Work Experience, Terminal,
Resume and two projects. The filmstrip was captured with the transition
stretched to 1.8s, because three frames of a 240ms shrink are three nearly
identical pictures; the duration that ships is 240ms.

## Not done, and why

Typed Terminal commands. The Fix line said "if the budget allows" and this
already spends 4.2 kB on the cards and the shrink. It is also the one piece of
the phase that is a new feature rather than polish on something that exists, so
it wants its own ticket and its own look rather than being slipped in here.

## Found on the way, fixed here

`/finder/opengraph-image` and `/safari/opengraph-image` returned 500. Asked for
a two-segment path where the first segment is a real folder, Next commits to
that folder and never falls back to `[app]`, so the two apps that have a route
folder of their own had no card. Both carry their own card file now, and
`[app]` generates only for the apps that have no folder, so no two routes write
the same file.

## After the first review round

Roast found one P1, in the new minimise test rather than in the code: it read
the dock icon while the pointer was still on it from opening the window, which
magnifies it by half again in width and lifts it 37px. The window is aimed at
the resting icon, so the two measurements were of different things, and the test
passed only because the icon eased back before the window measured it.

Verified before fixing, by measuring the same icon both ways: 75px wide with its
centre at y=817.8 under the pointer, 50px and y=854.5 at rest. The test reads the
icon's box before anything has hovered it now, and waits for the dock to come
back to that size. Ten runs green. Round two clean.
