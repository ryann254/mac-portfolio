/**
 * Every address the app registry promises has to come out of `next build` as a
 * file rather than as a function. A route that quietly turns dynamic still
 * works on Vercel, so nothing else would notice until a reader paid for a cold
 * start on a page that could have been sitting on the CDN.
 *
 * Run it after `pnpm build`.
 */
import { readFile } from 'node:fs/promises'
import { routes } from '../src/desktop/routes'

const MANIFEST = '.next/prerender-manifest.json'

type Manifest = { routes: Record<string, unknown> }

async function main(): Promise<void> {
  const text = await readFile(MANIFEST, 'utf8').catch(() => {
    throw new Error(`No ${MANIFEST} to read. Run \`pnpm build\`, then \`pnpm routes\`.`)
  })
  const prerendered = new Set(Object.keys((JSON.parse(text) as Manifest).routes))
  const missing = routes.filter((route) => !prerendered.has(route))

  if (missing.length > 0) {
    throw new Error(
      `The app registry promises these addresses and the build did not prerender them:\n${missing
        .map((route) => `    ${route}`)
        .join(
          '\n',
        )}\n  Each one needs a page under src/app whose generateStaticParams covers it, with dynamicParams turned off.`,
    )
  }

  console.log(`${routes.length} addresses, every one prerendered as static HTML:`)
  for (const route of routes) console.log(`    ${route}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
