---
status: open
owner:
files: []
pr:
---
Problem: A window manager on a 390 pixel phone is unusable, and most people sent a portfolio link open it on a phone.
Fix: Below 768 pixels, drop the window manager for an iOS home screen with the same registry apps, a status bar, and a dock. Tapping an app opens it full screen. Same routes, same content, different layout.
Done when:
- Every registry app opens from the home screen at 390 by 844.
- No screen scrolls horizontally at that width.
- Every phase 5 route loads with the right app open on mobile.
- Lighthouse mobile still scores 100 for performance and accessibility.
Out of scope: A tablet layout. Tablets keep the desktop.
