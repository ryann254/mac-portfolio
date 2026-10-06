---
status: doing
owner: agent:session-962984cc
files: []
pr:
---
Problem: A `.txt` window prints the content as flat monospace paragraphs and Safari's project pane fills half the window, so the two places a reader actually reads look like dumps rather than pages. Ryan called both boring on 2026-10-06.
Fix: Give a text file real structure instead of strings joined by newlines, and lay both windows out as something written rather than something printed. Mockup first, the way phase 2 settled the look.
Done when:
- The mockup has a tab per look and Ryan has picked one.
- A role, a project readme, and the intro each read as a document, derived from the same content as before.
- Safari's pane fills its window at every width the mockup shows.
- Every phase 6 and 7 test still passes, and the screenshots are retaken.
Out of scope: The mobile layout. Terminal, Photos, Resume, and Contact.
