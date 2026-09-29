---
status: done
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
pr: https://github.com/ryann254/mac-portfolio/pull/7
---
Problem: Windows open but the URL never changes, so nothing can be linked to or reloaded and a shared link lands on an empty desktop.
Fix: Generate a static route per app from the registry, plus one per project and Finder location. Opening a window pushes its route and back undoes it. Add the 404 as a Finder window.
Done when:
- A unit test proves route and app map onto each other one for one.
- Opening an app changes the URL with no reload, and back undoes it.
- A project URL loads with that window open and focused.
- The build output lists every registry route as static.
Out of scope: The content inside each window.

Turned in 2026-09-29. Sixteen addresses, every one prerendered as a file and
checked by `pnpm routes`. Opening a window pushes its address, back undoes it,
and a shared link lands with that window open and in front. An address nothing
answers to opens the Finder window a missing file would and keeps the address.

Phase 1's plain routes retire with this, because the registry owns the URL
space now and `/contact` cannot belong to both. The content comes back inside
windows in phases 6 and 7.

Evidence in the session scratchpad at `evidence/phase-5/`: ten screenshots in
both themes, `08-address-transcript.md` for what the address bar does at every
step, `09-back-and-forward.webm` for the run, and `10-walkthrough.html` from
bgr. JavaScript 145.7 kB of 230, total 285.0 kB of 600, Lighthouse mobile 0.96
to 0.97 with 1.0 elsewhere, 106 unit tests and 84 browser tests.

Review found one defect, fixed with a test that fails without the fix: back
through an address that named no folder left the window in the folder it was
already in, which rewrote the entry the reader had just reached.
