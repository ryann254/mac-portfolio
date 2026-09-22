# mac-portfolio

The portfolio of Ryan Waweru, a senior frontend engineer in Nairobi, built as a macOS desktop you can click around.

Read `PLAN.md` for the decisions, the app inventory, the performance budget, and the twelve phases. Read `AGENTS.md` for the commands and the rules that bite.

## Running it

```sh
pnpm install
pnpm dev
```

## Gates

```sh
pnpm check      # lint, typecheck, unit tests
pnpm test:e2e   # browser tests at 1440x900 and 390x844
pnpm build && pnpm size && pnpm lighthouse
```

## Credit

The macOS-as-a-portfolio idea comes from two places. [Daniel Prior's danielprior-macos](https://github.com/daprior/danielprior-macos), MIT licensed, which this borrows the boot screen, Launchpad, Spotlight, and window resize shapes from. And [JavaScript Mastery's macOS portfolio build](https://youtu.be/j9ZD_hlyHOA), which this follows for the window store, the Finder-led structure, and the app inventory.
