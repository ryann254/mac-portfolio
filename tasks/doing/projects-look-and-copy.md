---
status: doing
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
pr:
---
Problem: A project's readme and a role's file are the same document with a different logo on it, so the only thing telling a project from a job is the mark at the top. Two sentences in the summary also read wrong: a messaging product "with voice", and "mobile and on the backend" with nothing named after it.
Fix: Set a project readme the way Get Info does, with the facts about it in a panel: who it was built for, when, where it is live, what it moved, what built it. Rewrite both sentences everywhere they repeat and print the PDF again.
Done when:
- A project readme and a role file share nothing below the title.
- Every project's panel reads right, including the one with no numbers.
- Screenshots of both documents in both themes are on this task.
Out of scope: Safari's project page, which already reads as a browser.
