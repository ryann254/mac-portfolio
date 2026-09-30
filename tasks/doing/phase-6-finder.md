---
status: doing
owner: agent:session-962984cc
files:
  - src/desktop/file-tree.ts
  - src/desktop/file-tree.test.ts
  - src/desktop/finder-trail.ts
  - src/desktop/finder-trail.test.ts
  - src/desktop/finder.tsx
  - src/desktop/text-window.tsx
  - src/desktop/image-window.tsx
  - src/desktop/window-body.tsx
  - src/desktop/file-icon.tsx
  - src/desktop/apps.ts
  - src/desktop/apps.test.ts
  - src/desktop/locations.ts
  - src/desktop/routes.ts
  - src/desktop/routes.test.ts
  - src/desktop/window-store.ts
  - src/desktop/window-frame.tsx
  - src/desktop/desk-folders.tsx
  - src/desktop/dock.tsx
  - tests/finder.spec.ts
  - tests/desktop.ts
  - tests/windows.spec.ts
  - tests/routes.spec.ts
  - public/icons/folder.svg
  - public/icons/text-file.svg
  - public/icons/image-file.svg
  - PLAN.md
  - AGENTS.md
pr:
---
Problem: Projects, roles, and skills have no way in. Finder is how both reference portfolios let a visitor browse, and later phases share the windows it opens.
Fix: Build Finder with its sidebar and a location store for back, forward, and up. Derive the file tree from the content modules, no filename hand-written. Add the Text and Image windows.
Done when:
- The derived tree has a folder per project and a file per role.
- Location tests cover back, forward, up, and the boundaries of each.
- Double-clicking about.txt opens the summary, a thumbnail the image window.
- The Finder screenshot matches the tab Ryan approved in phase 2.
Out of scope: Safari, Terminal, Photos, Resume, and Contact.
