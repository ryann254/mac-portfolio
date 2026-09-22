---
status: open
owner:
files: []
pr:
---
Problem: The dock is there but nothing opens. Building the window manager alongside real apps hides drag and focus bugs behind content bugs.
Fix: Build the window store, the app registry, and a wrapper with a GSAP open animation and pointer drag. Add eight-handle resize, traffic lights, maximize, and z-order, exercised by a placeholder app.
Done when:
- Store tests cover open, focus, close, minimize, maximize, and bounds.
- Drag moves the window by the pointer delta and each handle resizes its own axis.
- Keyboard alone opens a window, focuses it, and closes it with Escape.
- The drag and resize run is recorded as a webm.
Out of scope: Finder, Safari, and every other real app.
