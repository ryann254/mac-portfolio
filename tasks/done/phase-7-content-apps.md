---
status: done
owner: agent:session-962984cc
files:
  - src/desktop/project-view.ts
  - src/desktop/project-view.test.ts
  - src/desktop/safari-tabs.ts
  - src/desktop/safari-tabs.test.ts
  - src/desktop/safari.tsx
  - src/desktop/terminal-transcript.ts
  - src/desktop/terminal-transcript.test.ts
  - src/desktop/terminal.tsx
  - src/desktop/photos.tsx
  - src/desktop/resume-window.tsx
  - src/desktop/contact-rows.ts
  - src/desktop/contact-rows.test.ts
  - src/desktop/contact.tsx
  - src/desktop/app-window.tsx
  - src/desktop/apps.ts
  - src/desktop/menu-bar.tsx
  - src/desktop/file-tree.ts
  - src/desktop/routes.ts
  - src/desktop/window-store.ts
  - tests/apps.spec.ts
  - tests/routes.spec.ts
  - tests/desktop.ts
  - src/desktop/apps.test.ts
  - src/desktop/window-state.ts
  - src/desktop/window-state.test.ts
  - src/app/globals.css
  - PLAN.md
  - AGENTS.md
pr: https://github.com/ryann254/mac-portfolio/pull/9
---
Problem: Finder opens files, but the five apps showing Ryan's projects, skills, resume, and contact details do not exist.
Fix: Build Safari with a tab strip over the projects, Terminal with a static skills transcript, Photos as a gallery, Resume in the browser's PDF viewer, and Contact as linked rows. Every view model is a pure function of the content.
Done when:
- Each view model is snapshot tested against the content modules.
- Safari lists all five projects and opens its link safely.
- Resume renders the PDF and the download button points at the real file.
- Every app screenshots in both themes, matching phase 2.
Out of scope: Typed Terminal commands. Launchpad, Spotlight, and Control Center.

## Turn-in

PR: https://github.com/ryann254/mac-portfolio/pull/9

Done when, line by line:

- Each view model is snapshot tested against the content modules.
  `src/desktop/safari-tabs.test.ts`, `terminal-transcript.test.ts`, `contact-rows.test.ts`,
  `resume-file.test.ts`, and `project-view.test.ts` for the picture and the employer line the
  three apps share. Each expectation is built from `src/content` rather than frozen into a
  `.snap` file, because a frozen one still passes on the day the CV changes and the app stops
  matching it.
- Safari lists all five projects and opens its link safely. `tests/apps.spec.ts` counts the tab
  strip against `projects` and reads `target="_blank"` and `rel="noopener noreferrer"` off the
  button. Screens 01 and 05.
- Resume renders the PDF and the download button points at the real file. `tests/apps.spec.ts`
  reads the `object`, its type, and the Download link, then fetches `/resume.pdf` and checks the
  server answers with a PDF. Screen 08 is Chrome rendering it, screen 09 a browser with no PDF
  viewer, which is what the fallback is for.
- Every app screenshots in both themes, matching phase 2. Screens 01 to 09, light and dark.
  Four deliberate differences, all in the PR: the resume runs in the browser's own viewer rather
  than a drawn page rail, Terminal's card prints five rows instead of six, Terminal's title bar
  is the standard one, and an enlarged photo carries a labelled way back instead of a hint in
  its caption.

Gates: `pnpm fix`, `pnpm typecheck`, 164 unit tests, roast on Fable 5.1 clean on every round,
then 106 browser tests with 52 skipped under 768px. Lighthouse mobile 0.96 over three runs, with
1.0 for accessibility, best practices and SEO. JavaScript 158.4 kB of 230 and none of the five
apps in it, total transfer 303.7 kB of 600, 16 addresses all prerendered.

Evidence, in the gitignored `evidence/phase-7/`: `00-contact-sheet.html` over the screens above,
`10-what-the-apps-do.md` read out of a real browser step by step with the tab order at the end of
it, `11-walkthrough.html` from bgr, the three Lighthouse reports, and the scripts that produced
them.
