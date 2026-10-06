---
status: doing
owner: agent:session-962984cc
files:
  - src/desktop/system-state.ts
  - src/desktop/system-state.test.ts
  - src/desktop/system-store.ts
  - src/desktop/appearance.ts
  - src/desktop/appearance.test.ts
  - src/desktop/appearance-store.ts
  - src/desktop/search.ts
  - src/desktop/search.test.ts
  - src/desktop/panel-layer.tsx
  - src/desktop/apple-menu.tsx
  - src/desktop/launchpad.tsx
  - src/desktop/spotlight.tsx
  - src/desktop/control-centre.tsx
  - src/desktop/about-this-site.tsx
  - src/desktop/system-curtain.tsx
  - src/desktop/boot-screen.tsx
  - src/desktop/menu-bar.tsx
  - src/desktop/dock.tsx
  - src/desktop/desktop.tsx
  - src/desktop/apps.ts
  - src/desktop/file-tree.ts
  - src/app/layout.tsx
  - src/app/globals.css
  - tests/panels.spec.ts
  - tests/system.spec.ts
  - tests/contrast.spec.ts
  - tests/desktop.ts
  - PLAN.md
  - AGENTS.md
pr:
---
Problem: The dock is the only way to reach an app, there is no search, and the theme cannot be changed, so the desktop still reads as a mockup.
Fix: Build Launchpad with search, Spotlight on Cmd+K, and Control Center for dark mode, brightness, and wallpaper, persisted to local storage. Add the Apple menu, reusing the phase 3 boot for Restart.
Done when:
- Spotlight ranks an exact app name first and finds projects by stack tag.
- Launchpad lists every registry app and filters as you type.
- Dark mode and the wallpaper choice both survive a reload.
- The theme screenshots from phases 3, 6, and 7 still match.
Out of scope: The mobile layout.
