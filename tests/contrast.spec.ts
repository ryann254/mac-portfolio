import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'
import { wallpapers } from '../src/desktop/appearance'
import { contrastRatio, type Rgb, requiredRatio } from '../src/lib/contrast'
import { chooseAppearance, gotoDesktop } from './desktop'

/**
 * Lighthouse skips contrast for text over an SVG or gradient, which is exactly
 * where this site puts all of it. So read the rendered pixels instead: make the
 * glyphs and their shadow transparent, screenshot the box the text occupied,
 * and take the lightest pixel left as the worst case a reader faces.
 *
 * Hiding the whole element would also hide any backdrop the text carries, which
 * is the thing making it readable. Only the letters go.
 */
async function lightestPixelBehind(
  page: import('@playwright/test').Page,
  selector: string,
  nth = 0,
): Promise<Rgb> {
  // The box the letters actually occupy, not the element's. An element's box
  // includes padding and the corners its own backdrop rounds off, and sampling
  // those reads the wallpaper behind text that never goes there.
  const box = await page
    .locator(selector)
    .nth(nth)
    .evaluate((node) => {
      const range = document.createRange()
      range.selectNodeContents(node)
      const { x, y, width, height } = range.getBoundingClientRect()
      return { x, y, width, height }
    })
  if (box.width === 0 || box.height === 0) throw new Error(`${selector} has no text to measure`)

  const inkless = await page.addStyleTag({
    content: `${selector}, ${selector} * { color: transparent !important; text-shadow: none !important; }`,
  })
  const shot = await page.screenshot({ clip: box })
  await inkless.evaluate((node: Element) => node.remove())

  const png = PNG.sync.read(shot)
  let lightest: Rgb = [0, 0, 0]
  let best = -1
  for (let i = 0; i < png.data.length; i += 4) {
    const pixel: Rgb = [png.data[i], png.data[i + 1], png.data[i + 2]]
    const against = contrastRatio(pixel, [255, 255, 255])
    if (best < 0 || against < best) {
      best = against
      lightest = pixel
    }
  }
  return lightest
}

const WHITE: Rgb = [255, 255, 255]

/**
 * Every wallpaper in both themes, because the reader picks both from phase 8 on
 * and a palette that reads well in one can wash out in another. One test per
 * palette rather than one per line of text: the same four screenshots either
 * way, and a failure names the wallpaper and then the line.
 */
for (const wallpaper of wallpapers) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${wallpaper.name} in ${theme} keeps every word over it readable`, async ({ page }) => {
      await chooseAppearance(page, { wallpaper: wallpaper.id, theme })
      await gotoDesktop(page)

      const lines: readonly [string, boolean][] = [
        ['h1', true],
        ['[data-testid="welcome-role"]', false],
        ['[data-testid="welcome-tagline"]', false],
      ]
      for (const [selector, large] of lines) {
        const behind = await lightestPixelBehind(page, selector)
        expect(contrastRatio(behind, WHITE), selector).toBeGreaterThanOrEqual(requiredRatio(large))
      }

      const labels = page.getByTestId('folder-label')
      for (let nth = 0; nth < (await labels.count()); nth += 1) {
        const behind = await lightestPixelBehind(page, '[data-testid="folder-label"]', nth)
        expect(
          contrastRatio(behind, WHITE),
          await labels.nth(nth).innerText(),
        ).toBeGreaterThanOrEqual(requiredRatio(false))
      }
    })
  }
}
