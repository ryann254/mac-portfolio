---
status: doing
owner: agent:session-962984cc
files:
  - src/desktop/routes.ts
  - src/desktop/locations.ts
  - src/desktop/window-url.ts
  - src/desktop/open-on-load.tsx
  - src/desktop/desktop.tsx
  - src/desktop/window-state.ts
  - src/desktop/window-store.ts
  - src/desktop/window-frame.tsx
  - src/desktop/window-layer.tsx
  - src/desktop/desk-folders.tsx
  - src/desktop/placeholder-app.tsx
  - src/desktop/apps.ts
  - src/app/layout.tsx
  - src/app/page.tsx
  - src/app/[app]/page.tsx
  - src/app/safari/[slug]/page.tsx
  - src/app/finder/[location]/page.tsx
  - src/app/not-found.tsx
  - src/app/(plain)/
  - scripts/routes-check.ts
  - tests/routes.spec.ts
  - tests/content.spec.ts
  - PLAN.md
  - AGENTS.md
pr:
---
Problem: Windows open but the URL never changes, so nothing can be linked to or reloaded and a shared link lands on an empty desktop.
Fix: Generate a static route per app from the registry, plus one per project and Finder location. Opening a window pushes its route and back undoes it. Add the 404 as a Finder window.
Done when:
- A unit test proves route and app map onto each other one for one.
- Opening an app changes the URL with no reload, and back undoes it.
- A project URL loads with that window open and focused.
- The build output lists every registry route as static.
Out of scope: The content inside each window.
