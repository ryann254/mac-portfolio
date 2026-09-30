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
| Route check, after a build | `pnpm routes` |
| Rebuild the resume PDF | `pnpm resume` |
| Everything the fast tier runs | `pnpm check` |

## Rules that bite here

- The app registry in `src/desktop/apps.ts` is the single source for the dock, Launchpad, Spotlight, and the routes. Adding an app means adding one entry, never a branch somewhere else. An entry with a `window` size opens on the desktop; one without is drawn but not opened. `reach` says how a reader gets to it: `desktop` is a dock icon and an address, `offsite` is a dock icon that opens a tab, and `file` is neither, because Finder opens it on a file and neither a dock icon nor a bare address carries one.
- Every rule about which windows are up and which is in front lives in `src/desktop/window-state.ts`, and every rule about where a window sits lives in `src/desktop/window-bounds.ts`. Both are pure. `window-store.ts` is the zustand store around them and the only place that reads the viewport. A rule that ends up in a component is a rule no unit test can reach.
- Every address on this site is generated from the registry by `src/desktop/routes.ts`, which maps a route to a window and back. A page under `src/app` renders no UI: the desktop is the root layout, and a page only says which window its address opens. `pnpm routes` fails after a build if an address the registry promises is not prerendered.
- `src/desktop/window-url.ts` is the only place that writes browser history. The address is whichever window is in front: opening one pushes, everything else replaces, and neither happens when the address is already right, which is what stops back from pushing the entry it just left.
- The window stack is an array in stacking order, front last. There is no z-index counter. Raising a window is a move to the end.
- Every app component loads with `next/dynamic` on first open, from the two tables in `src/desktop/app-window.tsx`: one for what fills a window, one for what an app puts in its title bar. The first load carries the shell only. `pnpm size` fails the build if that slips.
- Every folder and file Finder shows is derived from `src/content` by `src/desktop/file-tree.ts`. No filename is written down: a name is a slug out of the content with an extension on it, so a role added to the CV turns up as a file and a project as a folder with no other edit.
- Where Finder is, and where it has been, live in `src/desktop/finder-trail.ts`, pure. The folder the Finder window is in is the truth and the trail records it, so the address bar, the dock, and the folders on the desktop all end up in the trail without knowing about it. Every move that cannot be made hands the trail back unchanged, which is what makes back at the start, forward at the end, and up from the sidebar one rule rather than three.
- Anything an app puts in a title bar lets the pointer through where it has no control, so a window is still draggable by the empty part of its toolbar.
- Copy goes through the `humanizer` skill before it ships. See the copy section in `PLAN.md`.
- `public/resume.pdf` is generated from `src/content` by `pnpm resume`, never edited by hand. It is what a recruiter downloads, so it names no employer and `src/lib/resume.test.ts` keeps it that way. Editing content and forgetting to rerun leaves the two out of step.
- Window drag and resize use pointer events, never mouse events, so touch works.
- Every animation is gated on `prefers-reduced-motion`.
- Lists styled with `list-none` keep an explicit `role="list"`. Safari drops list semantics for VoiceOver once list styling is removed, so the role is doing real work. Biome's `noRedundantRoles` does not know that and is turned off. A list that keeps its `list-disc` marker does not need the role.
