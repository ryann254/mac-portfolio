---
status: review
owner: claude
files:
  - src/content/types.ts
  - src/content/experience.ts
  - src/desktop/file-tree.ts
  - src/desktop/text-window.tsx
  - src/desktop/safari.tsx
  - scripts/fetch-logos.ts
  - public/logos/
pr: https://github.com/ryann254/mac-portfolio/pull/12
---
Problem: Safari splits a project left and right, which Ryan asked for as a stack, and a role reads as a title with no sign of who it was for.
Fix: Put the screenshot back on top at half the window's height, fading into the words under it, and show the company's logo on a role's file.
Done when:
- A project page stacks at every width, picture above words.
- The picture ends in a fade, never a hard edge.
- Picture and words each get half the window's height.
- Every role wears a mark: the company's own logo, or initials where there is no site left to take one from.
- The logos come from a script a reviewer can rerun.
Out of scope: The mobile layout, which is phase 9.

## Turn-in

PR: https://github.com/ryann254/mac-portfolio/pull/12

Done when, line by line:

- A project page stacks at every width, picture above words. One column, no
  `flex-row` left in `safari.tsx`.
- The picture ends in a fade, never a hard edge. A mask, not a sheet of colour,
  so both themes get it from one rule. `tests/apps.spec.ts` reads the computed
  `mask-image` back and fails if it stops being a gradient.
- Picture and words each get half the window's height. Measured in the browser
  rather than read off the classes, because `basis-1/2` only lands on half if
  every box above it has a height to take half of. Both halves agree within two
  pixels at 940x620 and maximised at 1440x900.
- Every role wears a mark: the company's own logo, or initials where there is no site left to take one from.
  Four of eight have a logo. `tests/finder.spec.ts` opens one of each.
- The logos come from a script a reviewer can rerun: `pnpm logos`.

Gates: `pnpm fix`, `pnpm typecheck`, `pnpm check` clean, roast on Fable 5.1
clean with no findings on the first round, 222 unit tests, 151 browser tests
(81 skipped, all of them the mobile project phase 9 takes over).

Measurements: transfer 315.2 kB of 600, JavaScript 159.7 kB of 230.

Evidence in `evidence/reading-polish`: the project page in both themes at the
default window size and maximised, a role with a mark and one without in both
themes, a contact sheet of all four marks, and the bgr walkthrough.

## Follow-up, not filed

`pnpm resume` writes a new `public/resume.pdf` on every run because the
generator stamps the PDF with the time it ran. The bytes change when nothing
about the CV did, so a content edit cannot be told apart from a rebuild.

## After the turn-in

Ryan read the three options for the four companies with no reachable logo and
chose the lettermark. `lettermark.ts` derives the letters from the capitals the
company already writes its name with, and the colour from a hash of the name, so
a ninth role on the CV arrives with a mark and there is no table to keep in step.
White on a generated colour is exactly the thing that works for seven names and
fails for the eighth, so the browser test paints all four tiles and holds each to
4.5:1. At `oklch(0.48 0.13 h)` the worst of the four clears it.
