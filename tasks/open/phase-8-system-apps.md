---
status: open
owner:
files: []
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
