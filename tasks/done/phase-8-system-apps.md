---
status: done
owner: agent:session-962984cc
files:
  - AGENTS.md
  - PLAN.md
  - src/app/globals.css
  - src/app/layout.tsx
  - src/desktop/about-this-site.tsx
  - src/desktop/appearance-store.ts
  - src/desktop/appearance.test.ts
  - src/desktop/appearance.ts
  - src/desktop/apple-menu.tsx
  - src/desktop/apps.ts
  - src/desktop/boot-screen.tsx
  - src/desktop/boot-state.ts
  - src/desktop/control-centre.tsx
  - src/desktop/desktop.tsx
  - src/desktop/dock.tsx
  - src/desktop/file-tree.ts
  - src/desktop/launchpad.tsx
  - src/desktop/menu-bar.tsx
  - src/desktop/panel-layer.tsx
  - src/desktop/panels.test.ts
  - src/desktop/panels.ts
  - src/desktop/search.test.ts
  - src/desktop/search.ts
  - src/desktop/spotlight.tsx
  - src/desktop/system-curtain.tsx
  - src/desktop/system-state.test.ts
  - src/desktop/system-state.ts
  - src/desktop/system-store.ts
  - tests/boot.spec.ts
  - tests/contrast.spec.ts
  - tests/desktop.ts
  - tests/dock.spec.ts
  - tests/panels.spec.ts
  - tests/system.spec.ts
  - tests/windows.spec.ts

pr: https://github.com/ryann254/mac-portfolio/pull/10
---
Problem: The dock is the only way to reach an app, there is no search, and the theme cannot be changed, so the desktop still reads as a mockup.
Fix: Build Launchpad with search, Spotlight on Cmd+K, and Control Center for dark mode, brightness, and wallpaper, persisted to local storage. Add the Apple menu, reusing the phase 3 boot for Restart.
Done when:
- Spotlight ranks an exact app name first and finds projects by stack tag.
- Launchpad lists every registry app and filters as you type.
- Dark mode and the wallpaper choice both survive a reload.
- The theme screenshots from phases 3, 6, and 7 still match.
Out of scope: The mobile layout.

## Turn-in

PR: https://github.com/ryann254/mac-portfolio/pull/10

Done when, line by line:

- Spotlight ranks an exact app name first and finds projects by stack tag.
  `src/desktop/search.test.ts` asks for every app in the registry by its own name and gets
  that app back first, then asks for Flutter and gets each project whose stack holds it, with
  the stack in the row so the reader can see what matched. It also checks that every row
  opens something the registry or the file tree really has, which is how a role row opens its
  own file in Finder rather than a path written out twice. `tests/panels.spec.ts` does both
  through the box, and the arrow keys walk the results while the keyboard stays in it.
  Screen 03.
- Launchpad lists every registry app and filters as you type. It lists the eight a reader can
  open, which is `openableApps`: Launchpad is the grid rather than something in it, and
  TextEdit and Preview need a file Finder has already picked, so all three fall out of the
  same rule instead of being named. Screens 01 and 02.
- Dark mode and the wallpaper choice both survive a reload. Both, and the brightness, come
  back from local storage before the first paint, by the script in the layout rather than by
  React. `tests/panels.spec.ts` sets each one, reloads, and reads the colour off the gradient
  stop the wallpaper actually paints with; one of them also holds the theme against a system
  that says light. `appearance.test.ts` runs the real script against a document and asks what
  it wrote. Screens 04, 09, 10, 11.
- The theme screenshots from phases 3, 6, and 7 still match. Answered in pixels rather than by
  eye: phase 7's own screenshot script and one for phases 3 and 6 were run against `main` and
  against this branch and compared pixel by pixel, with the two clocks left out. All 29 are
  identical. `14-phase-7-screens-still-match.md` and `15-phase-3-and-6-screens-still-match.md`.

Four things this phase decided, all in `PLAN.md`: how the theme is held, why next-themes went,
why three wallpapers are three palettes rather than three pictures, and why a machine that is
off is a state of its own.

Gates: `pnpm fix`, `pnpm typecheck`, 204 unit tests, roast on Fable 5.1 over three rounds, then
133 browser tests with 75 skipped under 768px. Round 1 found two real ones, both fixed and both
with a test that would have caught them: turning the machine back on landed in the state a
session that has already watched the boot skips, so the curtain flashed rather than played, and
Enter in Launchpad on GitHub asked the window manager for a window it does not have and threw
inside the store. Its third finding said the dark-mode test compares an unresolved custom
property; measured in the browser, this Chromium resolves `light-dark()` in a custom property
(`#7a24e8` light, `#1c0552` dark), so the test was sound, though the helper now reads the
painted gradient stop instead, which is a better assertion either way. One more came from
reading a screenshot: the line on a sleeping screen was white at 35%, 2.9:1 on black, and it is
the only thing on that screen.

Measurements on this build: JavaScript 159.5 kB of 230, up 1.1 kB on main with none of the five
panels in it; total transfer 313.1 kB of 600, up 9.4 kB, of which 8.3 kB is the document and
about 1 kB of that is CSS: the two-branch dark variant costs 443 bytes gzipped and the two new
palettes 608. Lighthouse mobile 0.96, 0.96, and 0.99 over three runs, with 1.0 for
accessibility, best practices and SEO on all three. 16 addresses, all prerendered.

Evidence, in the gitignored `evidence/phase-8/`: `00-contact-sheet.html` over 23 screens in
both themes, `13-what-the-panels-do.md` read out of a real browser step by step with a
keyboard-only pass at the end of it, the two rematch reports above, `16-walkthrough.html` from
bgr, the three Lighthouse reports, and the seven scripts that produced them, including
`light-dark.mts`, which is the probe that checked `light-dark()` resolves inside an SVG
gradient stop before any of this was built on it.

One gap, handed to phase 9: Spotlight and Control Centre hang off menu bar icons that are
hidden under 640px, so a phone reaches Launchpad from the dock and neither of the other two.
The mobile layout is phase 9 and this ticket put it out of scope.
