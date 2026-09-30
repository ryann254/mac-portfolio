---
status: done
owner: agent:session-962984cc
files:
  - src/desktop/file-tree.ts
  - src/desktop/file-tree.test.ts
  - src/desktop/finder-trail.ts
  - src/desktop/finder-trail.test.ts
  - src/desktop/finder.tsx
  - src/desktop/text-window.tsx
  - src/desktop/image-window.tsx
  - src/desktop/app-window.tsx
  - src/desktop/file-icon.tsx
  - src/desktop/missing-file.tsx
  - src/desktop/apps.ts
  - src/desktop/apps.test.ts
  - src/desktop/locations.ts
  - src/desktop/routes.ts
  - src/desktop/routes.test.ts
  - src/desktop/window-store.ts
  - src/desktop/window-url.ts
  - src/desktop/window-frame.tsx
  - src/desktop/window-bounds.ts
  - src/desktop/desk-folders.tsx
  - src/desktop/dock.tsx
  - src/desktop/placeholder-app.tsx
  - src/app/[app]/page.tsx
  - tests/finder.spec.ts
  - tests/desktop.ts
  - tests/windows.spec.ts
  - tests/routes.spec.ts
  - tests/dock.spec.ts
  - public/icons/folder.svg
  - public/icons/text-file.svg
  - public/icons/image-file.svg
  - PLAN.md
  - AGENTS.md
pr: https://github.com/ryann254/mac-portfolio/pull/8
---
Problem: Projects, roles, and skills have no way in. Finder is how both reference portfolios let a visitor browse, and later phases share the windows it opens.
Fix: Build Finder with its sidebar and a location store for back, forward, and up. Derive the file tree from the content modules, no filename hand-written. Add the Text and Image windows.
Done when:
- The derived tree has a folder per project and a file per role.
- Location tests cover back, forward, up, and the boundaries of each.
- Double-clicking about.txt opens the summary, a thumbnail the image window.
- The Finder screenshot matches the tab Ryan approved in phase 2.
Out of scope: Safari, Terminal, Photos, Resume, and Contact.

## Turn-in

Done when, line by line:

- The derived tree has a folder per project and a file per role. `src/desktop/file-tree.test.ts`
  counts both against `src/content` rather than against a list, so the test fails if a name is
  ever written by hand instead of derived.
- Location tests cover back, forward, up, and the boundaries of each.
  `src/desktop/finder-trail.test.ts`. All three boundaries are one rule: the move hands back the
  trail it was given.
- Double-clicking `about.txt` opens the summary, a thumbnail the image window.
  `tests/finder.spec.ts`, and screens 06 and 07 in the evidence.
- The Finder screenshot matches the tab Ryan approved in phase 2. Screens 01 to 05, both themes.
  Two deliberate differences, both in the PR: the window opens at 980x640 rather than 1094x684
  because the same window is the 404, and an image file is drawn as a preview of itself rather
  than as the generic icon, which is what Finder does.

Gates: `pnpm fix`, `pnpm typecheck`, 134 unit tests, roast on Fable 5.1 to `clean: no findings`
after three defects fixed, then 97 browser tests with 43 skipped under 768px. Lighthouse mobile
0.97 to 0.99 over three runs, 1.0 for accessibility, best practices and SEO. JavaScript 157.3 kB
of 230, total transfer 300.0 kB of 600, 16 addresses all prerendered.

Evidence, in the session scratchpad at `evidence/phase-6/`: `00-contact-sheet.html` over ten
screens in both themes, `11-what-finder-does.md` read out of a real browser step by step,
`12-back-forward-and-up.webm`, `13-keyboard-walk.md` for the tab order with no pointer, the three
Lighthouse reports, and the scripts that produced all of it.
