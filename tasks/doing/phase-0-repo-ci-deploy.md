---
status: doing
owner: agent:claude-962984cc
files: [package.json, biome.json, vitest.config.ts, playwright.config.ts, lighthouserc.json, scripts/size-check.mjs, src/app/layout.tsx, src/app/page.tsx, src/app/globals.css, .github/workflows/ci.yml]
pr:
---
Problem: Mac-Portfolio has a plan and nothing else. No app runs, nothing catches a regression, and there is no URL to look at, so no phase can prove anything.
Fix: Scaffold Next.js with TypeScript strict and Tailwind 4. Add the three test tiers from PLAN.md and a page showing only the wallpaper. Wire GitHub and Vercel for previews.
Done when:
- A Vercel preview URL loads the wallpaper page.
- The three CI tiers run on that PR and are green.
- Lighthouse scores 100 for performance, accessibility, and best practices.
- One unit test and one browser test fail when broken on purpose.
Out of scope: Any macOS chrome. No dock, menu bar, windows, or boot screen.
