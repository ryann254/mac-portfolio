/**
 * Prints `src/lib/resume.ts` to `public/resume.pdf` through headless Chromium,
 * the same browser the size check uses. Run it with `pnpm resume` after editing
 * anything in `src/content`.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { experience } from '../src/content'
import { resumeHtml } from '../src/lib/resume'

const OUT = 'public/resume.pdf'
const FONT = 'public/fonts/inter-latin.woff2'

async function main(): Promise<void> {
  const font = await readFile(FONT)
  const html = resumeHtml(`data:font/woff2;base64,${font.toString('base64')}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })
  await page.evaluate(() => globalThis.document.fonts.ready)
  const pdf = await page.pdf({ format: 'A4', printBackground: true, preferCSSPageSize: true })
  await browser.close()

  await mkdir('public', { recursive: true })
  await writeFile(OUT, pdf)
  console.log(`  ${OUT}  ${(pdf.byteLength / 1024).toFixed(1)} kB, ${experience.length} roles`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
