---
status: review
owner: claude
files:
  - src/desktop/mobile/home-screen.tsx
  - src/desktop/panel-opener.tsx
  - src/desktop/menu-bar.tsx
  - src/desktop/window-bounds.ts
  - src/desktop/window-store.ts
  - src/desktop/window-frame.tsx
  - src/desktop/window-url.ts
  - src/desktop/desktop.tsx
  - src/desktop/dock.tsx
  - src/desktop/apps.ts
  - src/desktop/finder.tsx
  - src/desktop/safari.tsx
  - tests/mobile.spec.ts
pr: https://github.com/ryann254/mac-portfolio/pull/13
---
Problem: A window manager on a 390 pixel phone is unusable, and most people sent a portfolio link open it on a phone.
Fix: Below 768 pixels, drop the window manager for an iOS home screen with the same registry apps, a status bar, and a dock. Tapping an app opens it full screen. Same routes, same content, different layout.
Done when:
- Every registry app opens from the home screen at 390 by 844.
- No screen scrolls horizontally at that width.
- Every phase 5 route loads with the right app open on mobile.
- Lighthouse mobile still scores 100 for performance and accessibility.
Out of scope: A tablet layout. Tablets keep the desktop.

## Turn-in

PR: https://github.com/ryann254/mac-portfolio/pull/13

Done when, line by line:

- Every registry app opens from the home screen at 390 by 844. `tests/mobile.spec.ts`
  opens each one, measures that it fills the viewport, and presses Done to get
  the home screen back. The two offsite apps are anchors there and are checked
  for `target` and `rel` instead.
- No screen scrolls horizontally at that width. Every address in the registry
  plus `/` is loaded and `scrollWidth` compared against `clientWidth`.
- Every phase 5 route loads with the right app open on mobile. `/finder` and
  `/safari` settle onto the first folder and the first project, so the window
  wears that name rather than the app's, which the test accounts for.
- Lighthouse mobile. The ticket said 100 for performance; PLAN.md set that floor
  to 90 on 2026-09-24 when Inter stayed, and Ryan has said above .90 is fine, so
  90 is what this was held to. It scores 0.94, with accessibility, best
  practices and SEO all at 1.

Gates: `pnpm fix`, `pnpm typecheck`, `pnpm check` clean, roast on Fable 5.1
clean with no findings on the first round, 224 unit tests, 156 browser tests
(92 skipped), `pnpm routes` clean.

Measurements, all on this machine:

| | main | this branch |
| --- | --- | --- |
| Lighthouse mobile, performance | 0.95 | 0.94 |
| Largest contentful paint | 2.9 s | 3.0 s |
| Total transfer | 315.2 kB | 316.8 kB |
| JavaScript | 159.7 kB | 160.3 kB |

The point of performance is the eight home screen icons in the DOM. Dropping
their fetch priority did not move it, and the budget is 0.90.

Evidence in `evidence/phase-9`: the home screen, an open app, Finder, Spotlight
and Control Centre at 390x844, and the bgr walkthrough.

## Found on the way, fixed here

`window-url.ts` was subscribed to the whole store rather than to the window
stack, so a change to anything else could rewrite the address. Reading the
screen size on mount is what made it reachable: it notified with nothing open
and replaced a deep link with `/` before the window that address names had been
opened. Its own commit, `ca489b2`.

## Follow-up, not filed

The CI budget tier on PR #12 sat on `playwright install --with-deps chromium`
for over thirty minutes. Runner infrastructure rather than anything in the repo,
but worth watching: the step normally takes seconds and nothing in CI times it
out.
