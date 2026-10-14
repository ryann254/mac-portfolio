---
status: doing
owner: claude
files:
  - PLAN.md
  - src/lib/copy-tells.ts
  - src/lib/copy-tells.test.ts
  - src/app/global-error.tsx
  - src/app/global-error.test.tsx
  - scripts/copy-check.ts
  - tests/copy.spec.ts
  - .github/workflows/ci.yml
  - tasks/doing/phase-11-evidence-and-launch.md
pr: https://github.com/ryann254/mac-portfolio/pull/16
---
Problem: Each phase proved its own slice, but nobody has checked the finished site against the definition of done, and the copy added since phase 1 is unreviewed.
Fix: Run humanizer over every string added since phase 1 and script that check against the built HTML so it reruns. Run the whole suite on the production build, then walk the definition of done, attaching each line's artifact.
Done when:
- The copy script runs clean against the built HTML.
- Every line of the plan's definition of done has its artifact here.
- The keyboard-only walkthrough is recorded as a webm.
- Ryan confirms the site is live.
Out of scope: New features. Anything found here becomes its own task.

## Turn-in

Evidence is in `evidence/phase-11`: 78 screenshots, the keyboard recording, the
three Lighthouse reports, the bundle report, the boot probe, the copy check and
the browser suite's own log.

Done when, line by line:

- **The copy script runs clean against the built HTML.** `pnpm copy` reads 5
  content files and 17 pages and says clean. The built HTML turned out to be
  less than the plan assumed: every app body arrives with `next/dynamic`, so a
  page is 56 words of shell and none of the words inside the windows. The net
  is a module now, `src/lib/copy-tells.ts`, and `tests/copy.spec.ts` points the
  same list at the rendered page in a browser: every address, the five panels,
  the sleeping and locked screens, the two windows Finder opens on a file, and
  the home screen at 390px. Nothing hits.
- **Every line of the plan's definition of done has its artifact here.** Below.
- **The keyboard-only walkthrough is recorded as a webm.**
  `evidence/phase-11/keyboard/keyboard-only.webm`, 10.8s. No pointer is used:
  Tab to the dock, Enter opens Finder, the three lights are Tab stops, minimise
  puts it in the dock and Enter on the icon brings it back, Maximise fills the
  screen and Enter again restores it, Escape closes, then Cmd+K reaches Contact
  by name.
- **Ryan confirms the site is live.** The site is live and serving the merged
  copy at https://mac-portfolio-six.vercel.app, production, deployed from main.
  Robots, the sitemap and every link-preview card resolve against that origin
  and answer 200, and `/resume.pdf` is the 222,327-byte file the copy pass
  printed. `mac-portfolio.vercel.app` is somebody else's Vite app, not this.
  Ryan confirmed it on 2026-10-14 and bought `ryanwaweru.com` through Vercel
  the same day. Attaching that domain and moving the canonical origin onto it
  is a separate change and is not in this diff.

## The definition of done, line by line

| Line | Measured | Artifact |
| --- | --- | --- |
| Boot screen inside 1s, a press on the dock answered inside 3s, mobile profile | First paint 540-570ms, a press on the dock opens a window at 2.9s. Unthrottled: 140ms and 450ms. The line asked for 200ms and 1.5s until Ryan restated it on 2026-10-14. | `boot-probe.txt` |
| Lighthouse mobile: 90+ performance, 100 accessibility, 100 best practices, 90+ SEO | 0.95 median performance (0.93, 0.95, 0.95), 100, 100, 100 | `lighthouse-summary.txt`, `lighthouse/` |
| Each phase reports its own number | 0.95, against 0.97 in phase 3 and the 0.90 floor | same |
| First load under 600 kB, under 230 kB of JavaScript | 322.8 kB and 164.4 kB | `size-report.json` |
| Every dock app opens, drags, resizes, minimizes and closes, mouse and keyboard alone | 230 browser tests green on the production build. Dragging is the one thing with no keyboard equivalent: Maximise is the keyboard's resize. | `browser-suite.txt`, `keyboard/keyboard-only.webm` |
| A 390px phone reaches the same content | every address shot at 390 in both themes, `tests/mobile.spec.ts` green | `shots/*-phone-*.png` |
| Five projects with a thumbnail, a description, a role, a stack and a link | `content.test.ts` and `tests/apps.spec.ts` | `shots/safari-*.png` |
| Every app has a shareable address that lands with the app open | 16 addresses, every one prerendered | `routes-check.txt`, `tests/routes.spec.ts` |
| Every visible string reads like Ryan wrote it | clean on both surfaces; the one page in nobody's voice has been rewritten | `copy-check.txt`, `tests/copy.spec.ts` |

## Found on the way

The 500 screen was the only page on the site nobody here had written. Next
renders `_global-error.html` from its own component whatever the app provides,
so that file keeps the framework's words and the copy check skips it by name;
`src/app/global-error.tsx` is the boundary a reader actually lands on when the
app throws, it is now in Ryan's voice, and `global-error.test.tsx` runs the
same net over it.

A screenshot taken at anything other than one device pixel per CSS pixel
composites `backdrop-filter` wrongly in Chrome: every panel comes out half
transparent with the desktop reading through it. The first set of pictures was
taken at 2x and looked like a bug in the site. It is not: the hit test and the
stacking both say the panel is on top, and the same panel shot on its own is
solid. `evidence/phase-11-shots.ts` captures at 1x for that reason.

## The line that moved

The first line of the definition of done asked for the boot screen inside 200ms
and an interactive desktop inside 1.5s on Lighthouse's mobile profile. Measured
there it is 540-570ms and 2.9s. The gap is hydration: 164 kB of JavaScript
parsed and run on a main thread throttled to a quarter speed, and React answers
no press until that finishes, so the old number needs React off the first load.

Ryan restated the line on 2026-10-14. `PLAN.md` now asks for the boot screen
inside 1s and a press on the dock answered inside 3s, and keeps the measured
pair beside it so a drift shows up the way every other figure there does.
