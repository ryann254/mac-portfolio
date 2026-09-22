---
status: open
owner:
files: []
pr:
---
Problem: Each phase proved its own slice, but nobody has checked the finished site against the definition of done, and the copy added since phase 1 is unreviewed.
Fix: Run humanizer over every string added since phase 1 and script that check against the built HTML so it reruns. Run the whole suite on the production build, then walk the definition of done, attaching each line's artifact.
Done when:
- The copy script runs clean against the built HTML.
- Every line of the plan's definition of done has its artifact here.
- The keyboard-only walkthrough is recorded as a webm.
- Ryan confirms the site is live.
Out of scope: New features. Anything found here becomes its own task.
