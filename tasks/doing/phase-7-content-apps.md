---
status: doing
owner: agent:session-962984cc
files:
  - src/desktop/project-view.ts
  - src/desktop/project-view.test.ts
  - src/desktop/safari-tabs.ts
  - src/desktop/safari-tabs.test.ts
  - src/desktop/safari.tsx
  - src/desktop/terminal-transcript.ts
  - src/desktop/terminal-transcript.test.ts
  - src/desktop/terminal.tsx
  - src/desktop/photos.tsx
  - src/desktop/resume-window.tsx
  - src/desktop/contact-rows.ts
  - src/desktop/contact-rows.test.ts
  - src/desktop/contact.tsx
  - src/desktop/app-window.tsx
  - src/desktop/apps.ts
  - src/desktop/menu-bar.tsx
  - src/desktop/file-tree.ts
  - src/desktop/routes.ts
  - src/desktop/window-store.ts
  - tests/apps.spec.ts
  - tests/routes.spec.ts
  - tests/desktop.ts
  - PLAN.md
  - AGENTS.md
pr:
---
Problem: Finder opens files, but the five apps showing Ryan's projects, skills, resume, and contact details do not exist.
Fix: Build Safari with a tab strip over the projects, Terminal with a static skills transcript, Photos as a gallery, Resume in the browser's PDF viewer, and Contact as linked rows. Every view model is a pure function of the content.
Done when:
- Each view model is snapshot tested against the content modules.
- Safari lists all five projects and opens its link safely.
- Resume renders the PDF and the download button points at the real file.
- Every app screenshots in both themes, matching phase 2.
Out of scope: Typed Terminal commands. Launchpad, Spotlight, and Control Center.
