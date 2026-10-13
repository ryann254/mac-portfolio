/**
 * Fetches the one font the link-preview cards are drawn with, so the file in
 * the repo has somewhere it came from rather than being dropped in by hand.
 *
 * It is a `.woff`, which is the odd part. The site itself uses the `.woff2` in
 * `public/fonts`, half the size and what every browser since 2016 prefers, but
 * Satori draws the cards and refuses woff2 outright: `Unsupported OpenType
 * signature wOF2`. Google serves woff to anything that asks as an old browser,
 * which is what the user agent below is for.
 *
 * One weight. A card is a title and a line under it, and size and opacity
 * separate those without a second file.
 */
import { writeFile } from 'node:fs/promises'

const FAMILY = 'https://fonts.googleapis.com/css2?family=Inter:wght@600&display=swap&subset=latin'
const OLD_BROWSER = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko'
const INTO = 'src/lib/og/inter-600.woff'

async function main(): Promise<void> {
  const sheet = await fetch(FAMILY, { headers: { 'user-agent': OLD_BROWSER } })
  if (!sheet.ok) throw new Error(`Google Fonts answered ${sheet.status}`)

  const css = await sheet.text()
  const [, from] = css.match(/src:\s*url\(([^)]+)\)\s*format\('woff'\)/) ?? []
  if (!from) {
    throw new Error(
      'Google Fonts served no woff. It may have stopped answering to that user agent.',
    )
  }

  const font = await fetch(from)
  if (!font.ok) throw new Error(`${from} answered ${font.status}`)

  const bytes = Buffer.from(await font.arrayBuffer())
  if (bytes.subarray(0, 4).toString('latin1') !== 'wOFF') {
    throw new Error(`${from} is not a woff. The cards would fail to draw.`)
  }

  await writeFile(INTO, bytes)
  console.log(`${INTO}  ${bytes.length} B  ${from}`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
