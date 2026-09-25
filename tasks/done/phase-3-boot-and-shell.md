---
status: done
owner: agent:claude-962984cc
files: [src/desktop/**, src/app/page.tsx, src/app/layout.tsx, src/app/globals.css, src/content/profile.ts, src/content/types.ts, public/icons/**, tests/**, lighthouserc.json, PLAN.md]
pr: https://github.com/ryann254/mac-portfolio/pull/4
---
Problem: The site loads into nothing. With no boot screen, desktop, menu bar, or dock, no app has anywhere to open.
Fix: Build the boot screen so it paints from the server HTML before any JavaScript, then fades to the desktop. Add the wallpaper, welcome text, a menu bar clock, and a dock with magnification.
Done when:
- The boot markup is in the raw server response, not added after hydration.
- The desktop is interactive within 1.5 seconds on Lighthouse mobile.
- A keypress skips the boot, and a reload in the same session skips it.
- Reduced motion leaves the dock icons the same size on hover.
Out of scope: Windows, and the apps themselves.
