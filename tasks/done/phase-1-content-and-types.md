---
status: done
owner: agent:claude-962984cc
files: [src/content/profile.ts, src/content/projects.ts, src/content/experience.ts, src/content/types.ts, src/content/content.test.ts, src/app/(plain)/**, public/icons/**, public/wallpapers/**, public/projects/**, tests/content.spec.ts]
pr: https://github.com/ryann254/mac-portfolio/pull/2
---
Problem: Every later phase renders Ryan's CV and projects. Without typed content each app invents its own shape and the copy gets written twice over.
Fix: Add typed profile, projects, and experience modules. Enter the CV under the Senior Frontend Engineer headline, summary employer-neutral and through humanizer. Capture the three missing thumbnails, copy the macOS assets in, and render each section on a plain route.
Done when:
- Unit tests assert every project has a thumbnail on disk and a stack tag.
- No content file contains the word Moniepoint.
- Each plain route renders its heading and one known string.
- Ryan approves the rewritten summary on the PR.
Out of scope: Window chrome, dock, and any macOS styling.
