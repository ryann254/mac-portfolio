---
status: doing
owner: claude
files:
  - src/content/types.ts
  - src/content/experience.ts
  - src/desktop/file-tree.ts
  - src/desktop/text-window.tsx
  - src/desktop/safari.tsx
  - scripts/fetch-logos.ts
  - public/logos/
pr:
---
Problem: Safari splits a project left and right, which Ryan asked for as a stack, and a role reads as a title with no sign of who it was for.
Fix: Put the screenshot back on top at half the window's height, fading into the words under it, and show the company's logo on a role's file.
Done when:
- A project page stacks at every width, picture above words.
- The picture ends in a fade, never a hard edge.
- Picture and words each get half the window's height.
- Every role with a reachable logo shows it; the rest show none and still read.
- The logos come from a script a reviewer can rerun.
Out of scope: The mobile layout, which is phase 9.
