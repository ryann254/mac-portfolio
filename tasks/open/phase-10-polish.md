---
status: open
owner:
files: []
pr:
---
Problem: Minimize jumps instead of animating, shared links have no preview image, and nothing proves reduced motion turns every animation off.
Fix: Animate minimize into the dock, audit every animation against reduced motion, and generate an Open Graph image per route with the sitemap and robots files. Add typed Terminal commands if the budget allows.
Done when:
- With reduced motion set, no animation or transition on the page has a non-zero duration.
- Every route returns a preview image and appears in the sitemap.
- The bundle size check still passes.
Out of scope: New apps or new content.
