# Mac-Portfolio

Tracker: markdown tasks/

A portfolio for Ryan Waweru that looks and behaves like a macOS desktop. Read `PLAN.md` before touching anything; it holds the decisions, the app inventory, the performance budget, and the twelve phases.

## Stack

Next.js App Router, React 19, TypeScript strict, Tailwind 4, GSAP with Draggable, zustand, next-themes. Deployed to Vercel. Package manager is pnpm.

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
| Everything the fast tier runs | `pnpm check` |

## Rules that bite here

- The app registry in `src/desktop/apps.ts` is the single source for the dock, Launchpad, Spotlight, and the routes. Adding an app means adding one entry, never a branch somewhere else.
- Every app component loads with `next/dynamic` on first open. The first load carries the shell only. `pnpm size` fails the build if that slips.
- Copy goes through the `humanizer` skill before it ships. See the copy section in `PLAN.md`.
- Window drag and resize use pointer events, never mouse events, so touch works.
- Every animation is gated on `prefers-reduced-motion`.
