import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'
import { contrastRatio, type Rgb, requiredRatio } from '../src/lib/contrast'

/**
 * Lighthouse skips contrast for text over an SVG or gradient, which is exactly
 * where this site puts all of it. So read the rendered pixels instead: hide the
 * text, screenshot the box it occupied, and take the lightest pixel behind it
 * as the worst case a reader faces.
 */
async function lightestPixelBehind(
  page: import('@playwright/test').Page,
  selector: string,
): Promise<Rgb> {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error(`${selector} has no box to measure`)

  await page.locator(selector).evaluate((node) => {
    ;(node as HTMLElement).style.visibility = 'hidden'
  })
  const shot = await page.screenshot({ clip: box })
  await page.locator(selector).evaluate((node) => {
    ;(node as HTMLElement).style.visibility = ''
  })

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

test('the name stays readable over the wallpaper', async ({ page }) => {
  await page.goto('/')

  const behind = await lightestPixelBehind(page, 'h1')
  expect(contrastRatio(behind, WHITE)).toBeGreaterThanOrEqual(requiredRatio(true))
})

test('the job title stays readable over the wallpaper', async ({ page }) => {
  await page.goto('/')

  const behind = await lightestPixelBehind(page, 'main p')
  expect(contrastRatio(behind, WHITE)).toBeGreaterThanOrEqual(requiredRatio(false))
})
