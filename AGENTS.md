# Mac-Portfolio

Tracker: markdown tasks/

A portfolio for Ryan Waweru that looks and behaves like a macOS desktop. Read `PLAN.md` before touching anything; it holds the decisions, the app inventory, the performance budget, and the twelve phases.

## Stack

Next.js App Router, React 19, TypeScript strict, Tailwind 4, zustand. Deployed to Vercel. Package manager is pnpm. No animation library: phase 4 measured GSAP at 41.8 kB gzipped for one tween and built the window manager on CSS and pointer events for 2.7 kB. Adding one back needs a measurement and a line in `PLAN.md`.

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
- A text file is a title, a line under it, and blocks: a paragraph, a list, a labelled set of tags, a heading over a section, or the panel of facts a project's readme opens with. Nothing joins strings with newlines any more, because a role's title, company and dates each need their own place for the window to set them, and `text-window.tsx` is what sets them.
- A project's readme and a role's file are two documents, not one document with a mark on one of them. A role wears the company's mark and lists what was done under it; a project states the facts about it the way Get Info does, who it was built for, when, what it moved, what built it and where it is live, and keeps the write-up in prose under a heading. `file-tree.ts` decides both, and a project whose work has no figures gets no Results row rather than an empty one.
- A role's mark above its title is either the company's own logo or initials standing in for one, and `file-tree.ts` decides which. `pnpm logos` fetches a logo from that company's own site into `public/logos`; the four companies with no site left get a lettermark from `lettermark.ts`, which derives the letters and the colour from the name so a new role needs no table entry. A logo sits on a white tile in both themes, because every one of these was drawn for a white page. A lettermark brings its own colour, and `tests/finder.spec.ts` paints each one to check white still reads on it.
- Safari's project page is a stack, never two columns: the screenshot takes the top half and the write-up the bottom half, which scrolls on its own. The picture ends in a mask fade, not a hard edge, because all five screenshots are one 1440x900 homepage and every crop lands somewhere different. `tests/apps.spec.ts` measures both halves and checks the fade is still a gradient.
- Numbers in prose are set apart by `src/desktop/figures.ts`, which the text windows and Safari both read through, so a figure looks the same wherever it is written. A year is not a figure: a number counts when it carries a per cent, a plus, or a thousands comma.
- A project's `results` are the numbers its own sentences already say. `src/content/content.test.ts` refuses one the write-up does not say, and a project with none shows no tiles.
- Where Finder is, and where it has been, live in `src/desktop/finder-trail.ts`, pure. The folder the Finder window is in is the truth and the trail records it, so the address bar, the dock, and the folders on the desktop all end up in the trail without knowing about it. Every move that cannot be made hands the trail back unchanged, which is what makes back at the start, forward at the end, and up from the sidebar one rule rather than three.
- Anything an app puts in a title bar lets the pointer through where it has no control, so a window is still draggable by the empty part of its toolbar.
- Every content app is a pure view model in a `.ts` beside its `.tsx`, derived from `src/content` and tested against it: `safari-tabs.ts`, `terminal-transcript.ts`, `contact-rows.ts`, `resume-file.ts`, and `project-view.ts` for the two facts about a project no content file writes down, its employer and its host. A string a component invents is a string no unit test can hold to the CV.
- Every app that opens a window has a body in `app-window.tsx`, and `apps.test.ts` fails if one does not. There is no placeholder to fall back on any more.
- The menu bar names whichever window is in front, and Finder when there is none. Under 768px the same bar is the phone's status bar: the Apple menu, the app name and the named menus hide, and the clock moves to the left with `order`. It is one component because four of the things on it are the same at both sizes, and a second Control Centre button would be a second element answering to the same name, which is what every `[data-panel-opener]` selector would then match twice.
- Under 768px there is no window manager. `src/desktop/mobile/home-screen.tsx` stands in for the desktop's folders, and `window-store.ts` reports `phone`, which `window-frame.tsx` reads as `full`: no bounds, no handles, no drag, and Done instead of the three lights. Which shell is drawn is CSS, because the site is prerendered and a layout picked after hydration would show most readers the wrong one first. `tests/mobile.spec.ts` runs at 390x844 and nowhere else; every desktop spec carries the mirror skip.
- `window-url.ts` only writes the address when the window stack itself changed. The store holds more than the windows, and learning the screen size on mount once replaced a deep link with `/` before the window it named had opened.
- Any white word drawn straight onto the wallpaper carries `data-over-wallpaper`, and `tests/contrast.spec.ts` finds them all by that marker rather than naming each place they live: the desktop's folder labels at full width, the home screen's app names on a phone.
- The five panels, meaning Launchpad, Spotlight, Control Centre, About This Site, and the Apple menu, are one table in `src/desktop/panel-layer.tsx` and load on first open, the same way an app body does. One is up at a time, and the layer owns the three ways out: Escape, a press on the desktop behind, and a window coming up in front. A panel that closes itself is a panel with a fourth rule nobody else has.
- How the desktop looks is three settings in `src/desktop/appearance.ts`: two attributes and a custom property on `<html>`. CSS carries both halves of every colour as a `light-dark()` pair and the default wallpaper on `:root`, so a value nothing recognises falls back and a browser running no JavaScript still follows the system. The script in the layout and `appearance-store.ts` are the only writers, and both take the key and the names from `appearance.ts`.
- Anything a reader can press shows the hand. One rule in `globals.css`, in the components layer behind `:where()`, so it beats Tailwind 4's own `button { cursor: default }` in the base layer and every `cursor-*` utility beats it in turn. A control that wants a different cursor sets the utility and keeps it.
- A wallpaper has to read as a wallpaper rather than as a screen that is off, and `tests/wallpaper.spec.ts` holds each one in both themes to a CIELAB lightness plus chroma of 30. Brightness alone does not say it: a dark purple and a dark neutral grey can have the same lightness and only one of them looks like anything. `src/lib/colour.ts` does the arithmetic.
- `src/desktop/system-state.ts` is the whole of what the machine is doing, including which states hold the desktop behind a curtain and what lifts each one. A state that arrives with no way back to the desktop fails `system-state.test.ts` rather than stranding a reader.
- Copy goes through the `humanizer` skill before it ships. See the copy section in `PLAN.md`.
- `public/resume.pdf` is generated from `src/content` by `pnpm resume`, never edited by hand. It is what a recruiter downloads, so it names no employer and `src/lib/resume.test.ts` keeps it that way. Editing content and forgetting to rerun leaves the two out of step.
- Window drag and resize use pointer events, never mouse events, so touch works.
- Every animation is gated on `prefers-reduced-motion`, and `tests/motion.spec.ts` sweeps every element on every screen to prove it rather than spot-checking: a `transition` added without the `motion-safe:` in front of it fails the suite. One animation keeps a duration under reduce, the boot bar, because its `animationend` is what ends the boot; its keyframes hold the bar still and the same spec reads them off the stylesheet to check.
- A minimised window keeps its box and shrinks into its own dock icon. `window-frame.tsx` measures the icon when the window is minimised and hands CSS `--into-x`, `--into-y` and `--into-scale`; they default to the transform that does nothing, so the window is measurable at full size and a browser running no JavaScript still fades it out.
- Every address gets a link-preview card from `src/lib/og/`, and `src/app/sitemap.ts` lists the same `routes` the pages are generated from, so a new app or project turns up in both with no edit. Finder and Safari carry their own `opengraph-image.tsx` beside their route folder: asked for `/finder/opengraph-image`, Next commits to the `finder/` folder and never falls back to `[app]`.
- The origin the sitemap and the metadata are written against comes from `src/lib/site.ts`, which reads `NEXT_PUBLIC_SITE_URL`, then Vercel's own production host, then localhost. Nothing writes a URL down.
- Lists styled with `list-none` keep an explicit `role="list"`. Safari drops list semantics for VoiceOver once list styling is removed, so the role is doing real work. Biome's `noRedundantRoles` does not know that and is turned off. A list that keeps its `list-disc` marker does not need the role.
