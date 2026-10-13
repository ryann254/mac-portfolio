---
status: review
owner: claude
files:
  - src/desktop/file-tree.ts
  - src/desktop/text-window.tsx
  - src/desktop/file-tree.test.ts
  - src/content/profile.ts
  - src/content/projects.ts
  - src/content/experience.ts
  - public/resume.pdf
  - tests/finder.spec.ts
  - tests/motion.spec.ts
  - AGENTS.md
  - PLAN.md
pr: https://github.com/ryann254/mac-portfolio/pull/15
---
Problem: A project's readme and a role's file are the same document with a different logo on it, so the only thing telling a project from a job is the mark at the top. Two sentences in the summary also read wrong: a messaging product "with voice", and "mobile and on the backend" with nothing named after it.
Fix: Set a project readme the way Get Info does, with the facts about it in a panel: who it was built for, when, where it is live, what it moved, what built it. Rewrite both sentences everywhere they repeat and print the PDF again.
Done when:
- A project readme and a role file share nothing below the title.
- Every project's panel reads right, including the one with no numbers.
- Screenshots of both documents in both themes are on this task.
Out of scope: Safari's project page, which already reads as a browser.

## Turn-in

Done when, line by line:

- A project readme and a role file share nothing below the title. A role keeps
  the company's mark and the bulleted list; a project opens with the facts in a
  panel, built for, period, results, stack and where it is live, and the
  write-up under a heading as prose. `file-tree.test.ts` holds the two apart by
  the blocks they are made of, and `finder.spec.ts` checks the panel is drawn,
  that every row says what the file says, and that the readme wears no mark to
  be mistaken for a role's.
- Every project's panel reads right, including the one with no numbers.
  Kazi&Budget is the one, and it gets four rows rather than an empty Results
  row, which the unit test names.
- Screenshots of both documents in both themes are on this task.

The screenshot stays out of the readme on purpose. It is the file sitting next
to it in the same folder, Safari already opens on it at full width, and the
plan's own decision from 2026-10-07 says why no crop of these five works.

Two sentences in the summary were the other half of the ask. "A real-time
messaging product with voice" made voice sound like the product and says voice
support now; "I worked on mobile and on the backend" named nothing afterwards
and introduces the projects it leads into. Both repeat in four places, all four
match, and `public/resume.pdf` is printed again from the content.

Gates, both rounds: `pnpm fix`, `pnpm typecheck`, `pnpm check` clean including
the copy script, roast clean on the first round on Fable 5.1, 234 unit tests,
208 browser tests (96 skipped), `pnpm routes` clean at 16
addresses. Transfer 321.7 kB of 600 and JavaScript 163.3 kB of 230, up 0.7 kB
and 0.1 kB from main. Lighthouse mobile on `/`: performance 0.96, 0.98, 0.95,
with accessibility, best practices and SEO at 1.

Evidence in `evidence/projects-look-and-copy`: the readme and a role file beside
each other in both themes, the project with no figures, the readme at 390px, the
document as it was before this change, and `walkthrough.html` from bgr.

## Second round: the rest of the CV

Ryan asked whether the whole resume had been read or only the two sentences he
named. Only the two, so the rest got the same pass and he ruled on every line
that came back. Twenty-two replacements, applied by a script that fails unless
each one matches exactly once, so the run is the receipt that every ruling
landed.

What changed and why:

- Streamlyne's first bullet handed the policy answers to the researchers rather
  than to the product. It matches the achievement card now.
- "Build and maintain product" was missing a word. Features.
- "Helped modernize a long-running Java application ... and put the project in
  Docker" did not join up, and Ryan read the first rewrite as machine-made. It
  says what happened: a Java application that had been running for years, nearly
  half of it rebuilt one workflow at a time, load times down 44%.
- Two dashboards were led as objects. They are led by their development now.
- "the video and book management experience" is screens.
- The Discord bullet ended "without leaving where they already were", which is
  now "instead of signing in to the dashboard".
- Park254's "worked out parking time" says what the jobs worked out.
- The intern's "worked on performance and page loading" was two names for one
  thing.
- newLine's third bullet held reporting views and milestone planning in one
  sentence. Two bullets.
- Ad spending is reduced by 20%, not "improved by up to 20%". Ryan's wording.
- The achievement card claiming 45% of an unnamed application was the same Java
  work as the 44% card, so the two are one card and the 44% headline stays.
- Riyadh Real Estate opened with MajiSoft's sentence. It leads with the 500
  owners it brought on, which is the part only it can claim.
- Small ones: every figure reads "cut X by N%", the U.S. is spelled one way, the
  company name is not repeated under its own heading, a list that mixed areas
  with activities is areas, "cross-functional" is gone, and the skills group
  called "Also" is Practices.
- The desktop tagline ended "and many other sectors...". It names education and
  real estate and stops.

The PDF is printed again, still two pages, and both pages are in the evidence as
images. `copy-welcome.png`, `copy-role-streamlyne.png`, `copy-skills.png` and
`copy-terminal.png` show the same words on the site.

## Found on the way, fixed here

The boot bar test in `tests/motion.spec.ts` failed once in this branch's first
full run and the cause was the test. The bar is keyed on the boot state, so the
end of the boot replaces the element rather than changing it, and a handle taken
before that answers "" for every computed style afterwards. Resolving the
locator and then reading it left a 300ms window where a loaded machine reads the
old node and the test fails as though the bar had been on the wrong keyframes.
It is found and read in one step now, and a probe confirmed the mechanism before
the fix rather than after.

## Found on the way, not fixed

Opening a file in Finder is a double click, and nothing on the page sets
`touch-action: manipulation`, so on a phone the second tap can be read as a
request to zoom rather than as a way in. It shows up in the emulated iPhone
screenshot: the first attempt at the 390px shot came back zoomed and panned.
