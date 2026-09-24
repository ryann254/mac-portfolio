---
status: done
owner: agent:claude-962984cc
files: [public/about/**, public/resume.pdf, public/wallpapers/**, public/icons/notes.png, scripts/build-resume.ts, src/lib/resume.ts, src/lib/resume.test.ts, package.json, PLAN.md, AGENTS.md]
pr: https://github.com/ryann254/mac-portfolio/pull/5
---
Problem: Finder's About folder points at a photo that does not exist, the Resume app has nothing to open, and `public/` carries 820 kB that nothing references.
Fix: Draw a generic avatar rather than use Ryan's own photo, put a resume PDF in place that names no employer, and delete the unused wallpapers and the notes icon.
Done when:
- `public/resume.pdf` is there and names no employer anywhere in it.
- The avatar is drawn, not a photograph of a real person.
- `public/wallpapers/` and `public/icons/notes.png` are gone and nothing references them.
- The size check still passes.
Out of scope: The Finder and Resume apps themselves, which are phases 6 and 7.
