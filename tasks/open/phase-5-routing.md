---
status: open
owner:
files: []
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
