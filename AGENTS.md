# Mac-Portfolio

Tracker: markdown tasks/

A portfolio for Ryan Waweru that looks and behaves like a macOS desktop. Read `PLAN.md` before touching anything; it holds the decisions, the app inventory, the performance budget, and the twelve phases.

## Stack

Next.js App Router, React 19, TypeScript strict, Tailwind 4, zustand, next-themes. Deployed to Vercel. Package manager is pnpm. No animation library: phase 4 measured GSAP at 41.8 kB gzipped for one tween and built the window manager on CSS and pointer events for 2.7 kB. Adding one back needs a measurement and a line in `PLAN.md`.

## Commands

| What | Command |
| --- | --- |
| First-time setup | `pnpm install && pnpm exec playwright install chromium` |
| Dev server | `pnpm dev` |
| Format and lint, with fixes | `pnpm fix` |
| Lint check only | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Unit tests | `pnpm test` |
| Browser tests | `pnpm test:e2e` |
| Production build | `pnpm build` |
| Bundle size check | `pnpm size` |
| Rebuild the resume PDF | `pnpm resume` |
| Everything the fast tier runs | `pnpm check` |

## Rules that bite here

- The app registry in `src/desktop/apps.ts` is the single source for the dock, Launchpad, Spotlight, and the routes. Adding an app means adding one entry, never a branch somewhere else. An entry with a `window` size opens on the desktop; one without is drawn but not opened.
- Every rule about which windows are up and which is in front lives in `src/desktop/window-state.ts`, and every rule about where a window sits lives in `src/desktop/window-bounds.ts`. Both are pure. `window-store.ts` is the zustand store around them and the only place that reads the viewport. A rule that ends up in a component is a rule no unit test can reach.
- The window stack is an array in stacking order, front last. There is no z-index counter. Raising a window is a move to the end.
- Every app component loads with `next/dynamic` on first open. The first load carries the shell only. `pnpm size` fails the build if that slips.
- Copy goes through the `humanizer` skill before it ships. See the copy section in `PLAN.md`.
- `public/resume.pdf` is generated from `src/content` by `pnpm resume`, never edited by hand. It is what a recruiter downloads, so it names no employer and `src/lib/resume.test.ts` keeps it that way. Editing content and forgetting to rerun leaves the two out of step.
- Window drag and resize use pointer events, never mouse events, so touch works.
- Every animation is gated on `prefers-reduced-motion`.
- Lists styled with `list-none` keep an explicit `role="list"`. Safari drops list semantics for VoiceOver once list styling is removed, so the role is doing real work. Biome's `noRedundantRoles` does not know that and is turned off. A list that keeps its `list-disc` marker does not need the role.
