# Mac-Portfolio plan

A personal portfolio for Ryan Waweru, Senior Frontend Engineer, that looks and behaves like a macOS desktop. Visitors see a quick Apple boot, land on a desktop, and open apps from a dock to read about Ryan, browse five projects, and download the resume. It has to feel fast and work on a phone.

This file is the plan. Nothing is built yet. When you say go, the phases at the bottom become tasks in `tasks/` and work starts from phase 0.

## Decisions so far

Recorded 2026-09-22 from your answers. Change any of them by editing this section.

| Question | Answer |
| --- | --- |
| Framework | Next.js, confirmed. Chosen on developer support, package support, and load times, where it wins the first two outright and is close on the third. |
| Tracker | Markdown tasks in `tasks/`. |
| Hosting | Vercel, because Next.js. |
| Boot screen | Apple boot screen, fast. |
| Icons and wallpaper | Apple's app icons, as the tutorials use. Wallpapers drawn as SVG gradients. |
| Primary reference | JavaScript Mastery's video for structure and most content, Daniel Prior's repo and video for the parts JSM doesn't have. |
| Headline and title | "Senior Frontend Engineer", the role Ryan is looking for next. Work history stays as the CV has it, so the Streamlyne role still reads "Senior Software Engineer". |
| CV summary | Rewritten employer-neutral around the Senior Frontend Engineer framing, no Moniepoint paragraph. Draft in phase 1 for your approval. |
| Copy | Every visible string goes through `humanizer` before it ships. See the copy section. |
| Performance gate | 90, not 99, decided 2026-09-24. Inter costs two points on Lighthouse's mobile score and Ryan kept the font. See the definition of done. |
| Project thumbnails | Homepage screenshot, cropped, for Kazi&Budget, Surveva, and The Players Lounge. Streamlyne and newline use their og:image. If the mix looks uneven in the mockup, we screenshot all five. |

## Definition of done

The site is done when all of these are true:

- The boot screen shows within 200 ms of navigation and the desktop is interactive within 1.5 s on Lighthouse's mobile profile.
- Lighthouse on mobile scores 90 or better for performance and 100 for accessibility and best practices on `/`. SEO scores 90 or better. The bar was 99 until phase 3 put Inter on the page. Lighthouse charges the whole 48 KB font against the welcome heading, because the heading is the largest thing on the screen, and that alone takes largest contentful paint from 1.8 s to 2.5 s. 2.5 s is the top of Google's own good band, every other metric still scores a clean 1, and unthrottled the heading paints in 75 ms. Ryan kept the font and set the floor at 90 on 2026-09-24.
- What the page actually measures matters more than the floor, because a floor of 90 will not notice a slow slide. Phase 3 measures 0.97 locally and 0.95 to 0.97 on the GitHub runner, which is slower. Every phase from here reports its own number when it turns in, so a drift shows up in the turn-in even though the gate will not block it.
- First load of `/` transfers under 600 KB total and under 230 KB of JavaScript (gzipped), wallpaper included.
- Every app in the dock opens, drags, resizes, minimizes, and closes with a mouse and with a keyboard alone.
- On a 390px-wide phone the same content is reachable through an iOS-style layout.
- All five projects show a thumbnail, a description, Ryan's role, the stack, and a link.
- Every app has a URL you can share, and opening that URL lands with the app open.
- Every visible string has been through `humanizer` and reads like Ryan wrote it.

## What we take from each reference

### JavaScript Mastery, "Build and Deploy a MacOS style Portfolio" (primary)

Vite 7, React 19 in plain JSX, Tailwind 4, GSAP with Draggable, zustand with immer, react-pdf. The source is a paid kit, so we work from the chapter list and a public follow-along repo. The chapters, in order: Navbar, Welcome, Dock, Window Store, Higher Order Component, Safari, Resume, Location Store, Finder, Text and Image file windows, Contact, Home, Deployment.

We take the whole shape:

- A `WINDOW_CONFIG` keyed by window name with `isOpen`, `zIndex`, and `data`. Every window mounts once and a `WindowWrapper` HOC toggles it, plays the GSAP open animation, and makes it draggable with focus on press.
- A zustand window store with `openWindow`, `closeWindow`, `focusWindow`, and a `nextZIndex` counter.
- Finder as a file browser with a location store. Folders for About, Projects, Experience, and Skills. Text files open in a Text window, images in an Image window.
- Safari for the projects with live links.
- Terminal for skills.
- Photos as a gallery.
- Resume as a PDF viewer.
- Contact as a mail-style window.
- Welcome text on the desktop itself: name and title.
- An iOS-style mobile layout.
- All content in one typed constants module.

We change: TypeScript strict instead of JSX, zustand without immer, the browser's own PDF rendering instead of react-pdf, Next.js instead of Vite so pages prerender.

### Daniel Prior's portfolio (GitHub, MIT, and his walkthrough video)

Next.js 15 App Router, React 19, Tailwind 3, hand-rolled macOS chrome, `useState` in `desktop.tsx` with props drilled down, mouse-only events.

We take what JSM doesn't have:

- The boot screen, and Sleep, Lock, Restart, and Shut Down behind the Apple menu.
- Launchpad with search.
- Spotlight.
- Control Center with dark mode, brightness, and wallpaper.
- Eight-handle window resize and maximize that respects the menu bar and dock.
- Day and night wallpapers, dark mode through next-themes.
- The app and wallpaper assets in `public/`.

We leave: the prop drilling, mouse-only events, the unused shadcn boilerplate, and multiple windows per app.

Both authors get a credit line in the README.

## Decisions in detail

### Framework: Next.js on Vercel

Judged on the three things you named:

- Developer support. Next.js has the largest community, docs, and examples of the three, and every AI tool knows it best.
- Package support. Any React package works in Next.js. Astro islands are each their own React root, so packages that expect one provider at the top need extra care.
- Load times. Astro wins by 30 to 40 KB of JavaScript, which is 100 to 200 ms on 4G. Next.js prerenders every page at build, and the boot screen covers hydration. Both hit Lighthouse 100 with discipline.

So: the current stable Next.js with the App Router, React 19, TypeScript strict, Tailwind 4, GSAP 3 with `@gsap/react` and Draggable (GSAP and its plugins are free since 2025), zustand, next-themes. Deployed to Vercel on the free Hobby plan. No `output: 'export'`, because Vercel prerenders static pages by default and keeps `next/image` optimisation working, which the export mode disables.

The Vite SPA the JSM video uses was considered and set aside. With no prerendered HTML the desktop is blank until the JavaScript arrives, and you asked for SSG.

### Routing: one URL per app, pushState inside the desktop

Indexing is not a priority, but shareable links cost almost nothing in Next.js, so each app gets a route generated from the app registry:

| Route | Window open on load |
| --- | --- |
| `/` | none, desktop with the welcome text |
| `/finder` | Finder at About |
| `/finder/projects`, `/finder/experience`, `/finder/skills` | Finder at that location |
| `/safari` | Safari on the first project |
| `/safari/[slug]` | Safari on that project |
| `/terminal`, `/photos`, `/resume`, `/contact` | that app |

Inside the desktop, opening a window calls `window.history.pushState`, which the Next.js router picks up natively. Back closes or refocuses. A refresh lands on a page that renders with that one window open. All routes come from `generateStaticParams` over the app registry, so adding an app adds its route.

### Content: typed constants, like JSM, in TypeScript

`src/content/` holds `profile.ts`, `projects.ts`, and `experience.ts`, each exporting typed data. The Finder's file tree is derived from these at build, not written by hand. TypeScript's strict mode is the schema. No CMS, no markdown, no zod, because the only editor is you and the compiler already catches a missing field.

### State: one typed window store

zustand, no immer. `windows: Record<AppId, WindowState>` where `WindowState` is `{ status: 'closed' | 'open' | 'minimized', position, size, zIndex }` plus `focused: AppId | null` and `nextZ`. Actions: `open`, `close`, `focus`, `minimize`, `move`, `resize`, `maximize`. A second small store for Finder's location, as JSM does. The app registry, `apps.ts`, is one typed array of `{ id, title, icon, route, defaultSize, component }`. The dock, Launchpad, Spotlight, and the router all read that one array. No app-specific branches anywhere else.

### Motion: GSAP

Window open and close, minimize to the dock, dock magnification, Launchpad and Spotlight overlays, the boot progress bar. Draggable for window drag with the desktop as bounds. All gated on `prefers-reduced-motion`. Resize uses pointer events, not mouse events, so a tablet works.

### Boot screen: Apple boot, fast

Server-rendered in the HTML with inline CSS so it paints before any JavaScript. Apple logo, progress bar, about 1.2 s total, then a fade to the desktop. It plays once per browser session (`sessionStorage`), any click or key skips it, and `prefers-reduced-motion` cuts it to 300 ms. It doubles as the cover for hydration, so the desktop is interactive by the time the fade ends. The login screen from Daniel Prior's version is not on the load path. It lives behind Apple menu > Lock Screen, together with Sleep, Restart, and Shut Down.

### Mobile: iOS-style home screen

Under 768px there's no window manager. The page shows an iOS home screen with the same app icons, a status bar, and a bottom dock. Tapping an app opens it full-screen with a close button and swipe-down to dismiss. Same routes, same content, different layout component.

### Fonts: Inter, self hosted

The plan started on the system stack, because macOS uses SF Pro and Apple doesn't license it for the web. Seeing it in the phase 2 mockup settled it: on Linux and Windows the system stack is Segoe or DejaVu and the whole illusion reads as a web page rather than a Mac. Ryan picked Inter on the mockup, so Inter it is.

It ships as one variable file covering every weight, Latin subset only, 48 KB, through `next/font/local`. Self hosted, so no request to a third party and no flash of the wrong font. The CV has no accented characters outside Latin, so the other subsets would be 200 KB of nothing.

### Icons: Apple's assets. Wallpapers: drawn

App icons come from Daniel Prior's `public/` folder, which is where both tutorials get them. One line for the record: they're Apple's copyright, the same as on every macOS-clone portfolio out there. Three we draw ourselves, because no permissive source has them: the generic folder, text-file, and image-file icons, plus a LinkedIn app icon, since the only LinkedIn mark around is a flat glyph that sits badly next to Apple's.

The wallpapers are drawn as SVG gradients rather than shipped as photographs. Ryan picked the gradient look in phase 2, and a gradient is the one kind of image that vectorises for nothing: 2 to 8 KB of SVG against about 380 KB for the same thing as a JPEG. It also has to be SVG rather than CSS, because phase 0 proved a CSS gradient never fires a contentful paint and Lighthouse then refuses to score performance at all. Three are offered and Control Center switches between them.

## The apps

| Dock icon | Shows | Content source |
| --- | --- | --- |
| Finder | Sidebar with About, Projects, Experience, Skills. About holds `about.txt` and `photo.jpg`. Projects holds a folder per project with `readme.txt` and the thumbnail. Experience holds one `.txt` per role. Skills holds `skills.txt`. Double-click opens the Text or Image window. | derived from `content/` |
| Safari | One project at a time: URL bar with the real URL, thumbnail, description, Ryan's role, stack tags, an open-in-new-tab button, and a tab strip to switch projects. No iframe, several of the five sites block framing. | `content/projects.ts` |
| Terminal | Skills as a neofetch-style card, then `cat skills.txt`. Stretch: typed commands `help`, `about`, `projects`, `open streamlyne`, `contact`. | `content/profile.ts` |
| Photos | Gallery of the five project thumbnails, click to enlarge. | `content/projects.ts` |
| Resume | The resume PDF in the browser's own viewer with a Download button. | `public/resume.pdf` |
| Contact | Mail-style window. Email, LinkedIn, GitHub as rows. No form in v1. | `content/profile.ts` |
| Text, Image | Generic file windows Finder opens. Not in the dock. | Finder |
| GitHub, LinkedIn | External links in the dock, open in a new tab. | `content/profile.ts` |
| Launchpad | Grid of every app with search. | `apps.ts` |
| Spotlight | Cmd+K or the menu bar icon. Searches apps, projects, skills, roles. | `content/` |
| Control Center | Dark mode, brightness, wallpaper. Persisted to `localStorage`. | none |
| 404 | A Finder window titled "File not found" with a link home. | none |

The desktop itself shows the welcome text: name, "Senior Frontend Engineer", one line, as JSM's Welcome component does. The menu bar has the Apple menu (About This Site, Sleep, Lock Screen, Restart, Shut Down), the focused app's name, and the clock. Traffic lights: red closes, yellow minimizes to the dock, green maximizes under the menu bar.

Before building any of this, phase 2 makes a one-file HTML mockup with a tab per state so we agree on the look first.

## Content

### What the CV gives us

From `Senior Frontend Engineer - Moniepoint Inc..pdf`:

- Name Ryan Waweru. Nairobi, Kenya. Email, LinkedIn `ryan-w-3a81a9198`, GitHub `ryann254`.
- Eight roles from 2020 to present: Streamlyne (Senior Software Engineer, 07/2025 to now), Surveva (Senior Mobile Engineer), Riyadh Real Estate, newLine, Tintash, MajiSoft Innovations, Park254, SoftsearchLab.
- Key achievements with numbers: 29% more research submissions, 44% faster load times, 45% of an app migrated to React, 25% more subscriptions, 20% better ad spend.
- Skills in five groups. One diploma, two certifications.

Changes for the site, as agreed:

- Headline and page title are "Senior Frontend Engineer". Work history is untouched, so the Streamlyne role stays "Senior Software Engineer".
- The summary is rewritten employer-neutral and leads with frontend: React, TypeScript, Next.js, the real-time LLM messaging work. The Moniepoint sentence goes. The numbers stay.
- Email is shown in the open. It's a portfolio.

### The five projects

| Project | What it is | Ryan's link to it | Thumbnail |
| --- | --- | --- | --- |
| Streamlyne | Research administration software for US universities, with an LLM messaging product with voice | Current role. Built the LLM messaging platform, 29% more submissions, 44% faster loads | og:image |
| Kazi&Budget | Take-home salary and budget calculator for workers in Kenya, market percentile, 10-year projection | Own project, source in `../KaziNBudget` | homepage screenshot, cropped |
| Surveva | Consumer polling app, quick surveys with instant responses, iOS and Android | Senior Mobile Engineer. Flutter and Node, lazy loading cut survey load 25%, built CI/CD | homepage screenshot, cropped |
| newline | Courses and books for working web developers | Led the author dashboard for 5000+ students, Next.js and Redux, Discord API | og:image |
| The Players Lounge | Network for college athletes, athletic departments, and brands in the NIL era | The Tintash contract. Subscription dashboard, 25% more subscriptions, NFL sports product | homepage screenshot, cropped |

Screenshots are taken with agent-browser at 1440x900, cropped to 16:10, and served through `next/image` as AVIF and WebP.

## Copy

A recruiter reads this site in about ninety seconds, and copy that sounds machine-written undoes everything the desktop illusion buys us. So every visible string goes through the `humanizer` skill before it ships. Not just the summary: project descriptions, the Terminal transcript, empty states, button labels, the 404, the About This Site dialog, and the OG descriptions.

How it runs:

- Draft the copy, then run `humanizer` over it, then read the diff. It strips the tells: not-X-but-Y contrasts, forced triads, stock words like leveraging and seamless, bold labels, inflated claims, dashes standing in for commas.
- Keep the CV's numbers exactly as they are. 29%, 44%, 25%, 20%, 5000+ students, 500+ property owners. Humanizing the prose never touches a figure or a date.
- Ryan writes in the first person on the site. "I built", not "Ryan built" and not "was built". The Finder file names and the Terminal output stay terse, because that's how a real `about.txt` reads.
- Where a phrase is genuinely Ryan's, it stays even if a rule would cut it. A rule that makes a sentence worse gets ignored, loudly.

It runs twice. Once in phase 1, when the copy is first drafted, so we're not polishing text that later changes. Once in phase 11 over every string in the built site, caught by a script that greps the rendered HTML for the tells, so nothing added in phases 6 to 10 slips through.

## Performance budget

Phase 0 measured the floor instead of guessing it. A page with one heading on it costs 135.5 KB of gzipped JavaScript, which is React 19 and the Next.js App Router runtime and nothing of ours. That is the number every later phase builds on top of.

From there, all gzipped: GSAP core and Draggable about 30 KB, zustand 1 KB, next-themes 2 KB, and the shell we write, meaning the window manager, dock, menu bar, and boot screen, about 30 KB. That lands near 200 KB, so the JavaScript budget is 230 KB and the total transfer budget stays at 600 KB. Add app icons at 60 KB and Inter at 48 KB, with the wallpaper drawn inline for about 8 KB, and a cold load sits around 350 KB.

The first estimate here said 160 KB of JavaScript, written before anything had been built. It was wrong by the width of the Next.js runtime, and phase 4 would have breached it before a single window opened. Measure first, then budget.

Rules that keep us under it:

- Every app component loads with `next/dynamic` when first opened. The first load carries the desktop, dock, menu bar, and boot screen only.
- GSAP is imported piecemeal. If `pnpm size` shows more than 40 KB from it, Motion is the swap.
- One webfont, Inter, self hosted as a 48 KB variable Latin subset. No icon font. No analytics heavier than 2 KB.
- `pnpm size` loads the production build in a real browser and adds up what it downloads, listing the biggest resources so a phase can see what grew. It runs in CI and fails the build when it goes over.

## SEO, the basics only

Indexing isn't the goal, so this is the minimum that makes a shared link look right: per-route `<title>` and description through `generateMetadata`, an Open Graph image per route from `opengraph-image.tsx` with `next/og`, `sitemap.ts` and `robots.ts` from the app registry. Content is still real HTML inside each window (one `h1` per page, `<time>` on dates) because that costs nothing.

## Accessibility

- Each window is `role="dialog"` with `aria-labelledby` on its title. Opening moves focus into the window. Escape and Cmd+W close it. Cmd+M minimizes.
- The dock is a list of buttons with visible labels on focus. Tab order: menu bar, dock, windows in z-order.
- Focus rings are visible and styled, not removed.
- `prefers-reduced-motion` turns off magnification, open animations, and most of the boot.
- Colour contrast checked in both themes. The keyboard-only pass in phase 7 is part of the evidence.

## Folder layout

```
Mac-Portfolio/
  AGENTS.md                    the letter plus "Tracker: markdown tasks/"
  PLAN.md                      this file
  tasks/                       the tracker
  next.config.ts
  src/
    app/
      layout.tsx  page.tsx     boot screen and desktop
      [app]/page.tsx           one static route per app, generateStaticParams
      safari/[slug]/page.tsx
      finder/[location]/page.tsx
      not-found.tsx
      opengraph-image.tsx  sitemap.ts  robots.ts
    content/
      profile.ts  projects.ts  experience.ts
    desktop/
      Desktop.tsx  BootScreen.tsx  MenuBar.tsx  Dock.tsx  Welcome.tsx
      Window.tsx  WindowWrapper.tsx
      Launchpad.tsx  Spotlight.tsx  ControlCenter.tsx
      store/window.ts  store/location.ts
      apps.ts                  the app registry
      apps/                    Finder  Safari  Terminal  Photos  Resume  Contact  Text  Image
      mobile/                  HomeScreen  AppSheet
    styles/globals.css         Tailwind 4 theme tokens, light and dark
  public/
    icons/                     Apple's app icons
    fonts/                     inter-latin.woff2
    resume.pdf  favicon.ico
```

## Phases

Twelve phases, each one PR, each with its own tests. A phase's tests stay in the suite after it lands, so every later phase is also a regression run of everything before it.

Three test tiers, set up in phase 0 and fed by every phase after:

- Fast tier, runs on every push: Biome format and lint, `tsc --noEmit`, Vitest unit tests.
- Browser tier, runs on every PR: Playwright against the production build, desktop at 1440x900 and mobile at 390x844, screenshots and webm saved as artifacts.
- Budget tier, runs on every PR: `next build` with the bundle size check, Lighthouse CI on `/` with the thresholds from the definition of done.

### Phase 0: repo, CI, deploy

Build: `git init`, `AGENTS.md` with `Tracker: markdown tasks/`, `create-next-app` with TypeScript strict, Tailwind 4, App Router. Biome, Vitest, Playwright, Lighthouse CI, the bundle size check. GitHub repo and a Vercel project with a preview deploy per PR. A page with only the wallpaper.

Tests: the three tiers exist and run green on the wallpaper page. One placeholder unit test and one Playwright test that loads `/` and finds the wallpaper image, so the tiers are proven to fail when a test fails.

Done when: a PR preview URL loads on Vercel, all three CI tiers are green, and Lighthouse reports 100 on performance, accessibility, and best practices.

### Phase 1: content and types

Build: `profile.ts`, `projects.ts`, `experience.ts` with their types. The CV entered with the new headline and the rewritten summary. Every string through `humanizer` before the PR opens. Three homepage screenshots captured and cropped, two og:images fetched. Apple's icons in `public/`. Plain routes that render each section as HTML with no desktop yet.

Tests, unit: every project has a `url`, a `thumbnail` that exists on disk, and at least one stack tag. Experience roles are in reverse date order with no gaps in required fields. The word "Moniepoint" appears nowhere in `content/`. The headline equals "Senior Frontend Engineer". Tests, browser: every plain route renders its `h1` and one known string from its content.

Done when: the unit tests pass, every route renders, and you've approved the rewritten summary on the PR. The humanizer diff is attached to the task so you can see what changed.

### Phase 2: mockup and look

Build: one self-contained HTML mockup with a tab per state: boot, desktop idle, one window, two windows, minimized, Finder at each location, Safari on a project, Launchpad, Spotlight, Control Center, dark mode, mobile home, mobile app open, 404.

Tests: manual by design. You click through every tab. There's no automated test for taste.

Done when: you've seen every tab and listed what to change, and the list is attached to the task.

### Phase 3: boot and desktop shell

Build: the boot screen, wallpaper, welcome text, menu bar with a live clock, dock with magnification. No windows yet.

Tests, unit: the boot state machine (`booting`, `desktop`, `sleeping`, `locked`, `restarting`) and the once-per-session rule. Tests, browser: the boot screen is in the server HTML (assert on the raw response, not the DOM after hydration), the desktop is visible within 1.5 s, a keypress skips the boot, a reload in the same session skips it, the clock shows the current minute, `prefers-reduced-motion` disables dock magnification (assert the icon's bounding box doesn't change on hover). Screenshots of boot and idle desktop in both themes.

Done when: those tests pass and the JavaScript budget check passes with the shell alone.

### Phase 4: window manager

Build: the window store, `apps.ts`, `WindowWrapper` with the GSAP open animation and Draggable, eight-handle resize, traffic lights, maximize under the menu bar, z-order. One placeholder app to exercise it.

Tests, unit: the store's rules. Opening focuses and takes the top z-index, focusing an already open window raises it, closing moves focus to the next highest, minimizing hides but keeps position and size, maximize and restore round-trip, a move can't push the title bar under the menu bar. Tests, browser: drag changes the bounding box by the pointer delta, each of the eight handles resizes on the right axis, red closes, yellow minimizes, green maximizes, clicking a window behind brings it to the front. Keyboard: Tab reaches the dock, Enter opens, focus lands inside the window, Escape and Cmd+W close, Cmd+M minimizes. A webm of the drag and resize run.

Done when: those tests pass on desktop and the touch-pointer variant of the drag test passes at tablet width.

### Phase 5: routing

Build: a static route per app from `generateStaticParams` over the registry, `safari/[slug]` and `finder/[location]`, `pushState` on open, back and forward, `not-found.tsx` as a Finder window.

Tests, unit: the route-to-app and app-to-route mapping is a bijection over the registry. Tests, browser: opening an app changes the URL without a reload, back closes it, forward reopens it, a direct load of `/safari/streamlyne` renders with that window open and focused, an unknown URL renders the 404 Finder window. Build: the `next build` route list contains every registry route.

Done when: those tests pass and the build output lists every route as static.

### Phase 6: Finder, Text, and Image

Build: Finder with the sidebar and the location store, the file tree derived from `content/`, Text and Image windows.

Tests, unit: the derived file tree has one folder per project, one file per role, `about.txt` and `skills.txt`, and location navigation (back, forward, up) obeys the same rules as a real Finder. Tests, browser: click each sidebar location, double-click `about.txt` opens a Text window with the summary, double-click a thumbnail opens an Image window, the Finder title shows the current location.

Done when: those tests pass and the Finder screenshot matches the approved mockup tab.

### Phase 7: the content apps

Build: Safari, Terminal (static transcript), Photos, Resume, Contact.

Tests, unit: each app's view model is a pure function of `content/` and is snapshot tested. Tests, browser: Safari shows every project in its tab strip and the open-in-new-tab button has `target="_blank"` and `rel="noopener"`, Terminal lists every skill group, Photos shows five thumbnails and enlarges on click, Resume renders the PDF viewer and the Download button points at `/resume.pdf`, Contact's three rows link to the right places. Screenshots of each app in both themes.

Done when: those tests pass and every app's screenshot matches its mockup tab.

### Phase 8: system apps

Build: Launchpad, Spotlight, Control Center with dark mode, brightness, and wallpaper, the Apple menu with About This Site, Sleep, Lock Screen, Restart, Shut Down.

Tests, unit: the Spotlight search function ranks an exact app name first, finds projects by name and by stack tag, finds roles by company, and returns nothing for an empty query. Tests, browser: Cmd+K opens Spotlight and Escape closes it, choosing a result opens the app, Launchpad shows every registry app and filters as you type, dark mode toggles and survives a reload, wallpaper choice survives a reload, Lock Screen and Sleep show and dismiss, Restart replays the boot.

Done when: those tests pass and the theme screenshots from phases 3, 6, and 7 still match.

### Phase 9: mobile

Build: the iOS home screen under 768px, full-screen app sheets, status bar, bottom dock, swipe-down to dismiss.

Tests, browser at 390x844: every registry app opens from the home screen, no horizontal scroll on any screen, the close button and swipe both dismiss, every route from phase 5 loads with the right app open. Budget: Lighthouse mobile stays at 100 on performance and accessibility.

Done when: those tests pass and the mobile screenshots match the two mockup tabs.

### Phase 10: polish

Build: minimize-to-dock animation, reduced motion everywhere, OG image per route, `sitemap.ts`, `robots.ts`, Terminal commands if there's time.

Tests, browser: with `prefers-reduced-motion`, no animation on the page runs longer than 0 ms (read the computed animation and transition durations), every route's `opengraph-image` returns 200 and a PNG, the sitemap lists every registry route. Terminal, if built: `help` lists the commands, `open streamlyne` opens Safari on it.

Done when: those tests pass and the size check still passes.

### Phase 11: evidence and launch

Build: nothing new, except the second `humanizer` pass over every string added since phase 1, and a small script that greps the built HTML for the tells so the check can be rerun. The domain pointed at Vercel, if you have one.

Tests: the whole suite once more on the production build, plus the copy script over the built HTML with a clean result. Then the definition of done at the top, line by line, each with an artifact: Lighthouse reports, the full screenshot set in both themes at both widths, the keyboard-only webm, the bundle report, the copy script output.

Done when: every line of the definition of done has its artifact attached to the task and you've said it's live.

## How each phase turns in

The squirrel flow, unchanged: claim the task in `tasks/`, work in a worktree on a branch, format and lint with autofix, typecheck, fast tests, roast until it says well done, full suite once, evidence on the task, PR open, stop. You review and merge. I don't merge my own PRs. If roast or bgr isn't installed when phase 0 starts, I say so before starting rather than skipping it.

## What I need from you

- A headshot for `about/photo.jpg` in Finder. Optional, but the folder looks empty without it.
- The resume PDF to serve from `/resume`. The Moniepoint one has the Moniepoint paragraph, so either a neutral version from you or I generate one from the site content.
- A domain, if you have one. Otherwise `*.vercel.app` for now.
- The go-ahead to start phase 0.

## Sources

- JavaScript Mastery, "Build and Deploy a MacOS style Portfolio with React, GSAP & Tailwind": https://youtu.be/j9ZD_hlyHOA, demo at https://jsmfolio.netlify.app, source is a paid kit
- Daniel Prior's repo: https://github.com/daprior/danielprior-macos (MIT), live at https://www.danielprior.dev
- Daniel Prior's walkthrough video: https://youtu.be/akcRlji85IU
- CV: `/home/pirate-hunter/Downloads/Senior Frontend Engineer - Moniepoint Inc..pdf`
- Kazi&Budget source: `../KaziNBudget`
- Project sites: https://streamlyne.com, https://kazinbudget.netlify.app, https://surveva.com, https://www.newline.co, https://www.theplayerslounge.io
