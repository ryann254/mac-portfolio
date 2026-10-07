---
status: done
owner: agent:session-962984cc
files:
  - AGENTS.md
  - PLAN.md
  - src/content/content.test.ts
  - src/content/projects.ts
  - src/content/types.ts
  - src/desktop/figures.test.ts
  - src/desktop/figures.ts
  - src/desktop/file-tree.test.ts
  - src/desktop/file-tree.ts
  - src/desktop/prose.tsx
  - src/desktop/safari-tabs.test.ts
  - src/desktop/safari-tabs.ts
  - src/desktop/safari.tsx
  - src/desktop/text-window.tsx
  - tests/apps.spec.ts
  - tests/finder.spec.ts
pr: https://github.com/ryann254/mac-portfolio/pull/11
---
Problem: A `.txt` window prints the content as flat monospace paragraphs and Safari's project pane fills half the window, so the two places a reader actually reads look like dumps rather than pages. Ryan called both boring on 2026-10-06.
Fix: Give a text file real structure instead of strings joined by newlines, and lay both windows out as something written rather than something printed. Mockup first, the way phase 2 settled the look.
Done when:
- The mockup has a tab per look and Ryan has picked one.
- A role, a project readme, and the intro each read as a document, derived from the same content as before.
- Safari's pane fills its window at every width the mockup shows.
- Every phase 6 and 7 test still passes, and the screenshots are retaken.
Out of scope: The mobile layout. Terminal, Photos, Resume, and Contact.

## Turn-in

PR: https://github.com/ryann254/mac-portfolio/pull/11

Done when, line by line:

- The mockup has a tab per look and Ryan has picked one. Two rounds of it. The first had five looks
  for the text files and three for Safari; Ryan took the document look for the files, asked for the
  percentages to be bolder, and sent Safari back. The second had three new Safari looks built around
  his own numbers, and he took the one where the screenshot runs edge to edge. `mockup.html` is the
  second round, `build.py` makes it, and the content in it is dumped out of `src/content` by
  `content.mts` so nothing in the mockup was a stand-in.
- A role, a project readme, and the intro each read as a document, derived from the same content as
  before. A text file is a title, a line under it, and blocks: a paragraph, a list, or a labelled set
  of tags. `file-tree.test.ts` builds its expectations out of `src/content`, so a role added to the
  CV is still a file with no edit anywhere. The skills sheet came along for free: five labelled sets
  of tags instead of five lines of comma-separated monospace.
- Safari's pane fills its window at every width the mockup shows. Screens 01, 02 and 07. The five
  screenshots are each one 1440x900 view of a homepage, so no height shows a whole one; it fades out
  rather than stopping on a line, which a hard edge proved when it cut `ELEVATING COLLEGE` in half
  on The Players Lounge.
- Every phase 6 and 7 test still passes, and the screenshots are retaken. 109 browser tests, four of
  them new, and `00-before-and-after.html` has the same six windows shot against `origin/main` and
  against this branch.

The figures: `results` on a project, two at most, and `content.test.ts` refuses any number the
project's own write-up does not already say. **The five lines are mine and want your eye on them**:
Streamlyne `29% more research submissions` and `44% faster load times`, Surveva `25% faster survey
loads`, newline `5,000+ students reached`, The Players Lounge `25% more subscriptions`. Kazi&Budget
has no numbers in its write-up and so shows no tiles, which is what Ryan asked for.

Gates: `pnpm fix`, `pnpm typecheck`, 177 unit tests, roast on Fable 5.1 clean on both rounds, then
109 browser tests with 55 skipped under 768px. JavaScript 158.4 kB of 230, unchanged from main;
total transfer 305.1 kB of 600, up 1.4 kB for the figures and the markup around them. Lighthouse
mobile 0.96 over three runs with 1.0 for accessibility, best practices and SEO.

Evidence, in the gitignored `evidence/reading-view/`: `mockup.html` and the looks it was chosen
from, `00-before-and-after.html` over twelve pairs and all five Safari tabs, the three Lighthouse
reports, and the five scripts that made them.

One follow-up, not in this branch: opening a file from Finder blocks for about 218ms the first time,
which is the window's code being fetched. Preloading it on hover would fix it.

### After the turn-in

Ryan maximised a Safari window and found the full-width screenshot reduced to a letterbox strip
over 450px of nothing, and asked for half the picture and half the words. It is two halves now,
stacking under 620px, and the picture is fitted rather than cropped: at a maximised window it is
larger than the full-width band ever was, and no screenshot loses 40% of itself to a crop. Shots
10 and 11 are the same window at the size it opens and at the size it maximises to.
