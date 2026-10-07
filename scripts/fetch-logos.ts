/**
 * Downloads each company's own logo into `public/logos`, so the files in the
 * repo have somewhere they came from rather than being pasted in by hand.
 *
 * Four of the eight companies have no site left to take one from. The script
 * says which, and `experience.ts` leaves their `logo` off: a role without one
 * still reads, because the line under the title names the company anyway.
 *
 * These are other people's marks on other people's servers. A URL here goes
 * stale when they redeploy, which is the price of not inventing a logo.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { experience } from '../src/content/experience'

/** Role slug to the logo on that company's own site. */
const SOURCES: Readonly<Record<string, string>> = {
  streamlyne: 'https://streamlyne.com/img/logo.svg',
  surveva: 'https://res.cloudinary.com/dkaktaoya/image/upload/v1749024359/desktop_logo_qbueuk.svg',
  newline:
    'https://d8dgeb1f3fxgw.cloudfront.net/static/img/logo/newline/newline-logo-longwise-solo-lightbg-gray.svg',
  tintash: 'https://tintash.com/static/tintash-logo-blue-be671bb70f58af2e5f9f71a9daa455f0.svg',
}

const DIRECTORY = 'public/logos'

/**
 * An SVG drawn by `<img>` cannot run what is inside it, but these files are
 * read by whoever opens the repo next, and a remote script tag in one would be
 * a surprise. Anything that fetches or executes is refused rather than cleaned,
 * because a mark that needs either is the wrong file.
 */
const REFUSED = /<script|<foreignObject|\son\w+\s*=|href\s*=\s*["']?\s*javascript:/i

async function fetchLogo(slug: string, from: string): Promise<number> {
  const response = await fetch(from, { headers: { 'user-agent': 'mac-portfolio/logos' } })
  if (!response.ok) throw new Error(`${from} answered ${response.status}`)

  const svg = await response.text()
  if (!svg.includes('<svg')) throw new Error(`${from} is not an SVG`)
  if (REFUSED.test(svg)) throw new Error(`${from} has a script or a handler in it`)

  await writeFile(`${DIRECTORY}/${slug}.svg`, svg.trimEnd() + '\n')
  return svg.length
}

async function main(): Promise<void> {
  await mkdir(DIRECTORY, { recursive: true })

  const unknown = Object.keys(SOURCES).filter(
    (slug) => !experience.some((role) => role.slug === slug),
  )
  if (unknown.length > 0) {
    throw new Error(`No role for ${unknown.join(', ')}. A source names a slug nobody has.`)
  }

  for (const [slug, from] of Object.entries(SOURCES)) {
    const bytes = await fetchLogo(slug, from)
    console.log(`${slug.padEnd(16)} ${String(bytes).padStart(7)} B  ${from}`)
  }

  const without = experience.filter((role) => SOURCES[role.slug] === undefined)
  if (without.length > 0) {
    console.log(`\nNo logo, no site to take one from: ${without.map((r) => r.company).join(', ')}`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
