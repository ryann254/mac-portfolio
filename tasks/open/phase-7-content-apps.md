---
status: open
owner:
files: []
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
