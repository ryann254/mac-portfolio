import { expect, test } from '@playwright/test'
import { PNG } from 'pngjs'
import { wallpapers } from '../src/desktop/appearance'
import { type Look, lookOf } from '../src/lib/colour'
import { chooseAppearance, gotoDesktop } from './desktop'

test('the desktop paints its wallpaper', async ({ page }) => {
  await gotoDesktop(page)

  const wallpaper = page.getByTestId('wallpaper')
  await expect(wallpaper).toBeVisible()
  const box = await wallpaper.boundingBox()
  expect(box?.width).toBeGreaterThan(300)
})

test('the wallpaper turns to its night palette in dark mode', async ({ page }) => {
  await gotoDesktop(page)

  const dayBase = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--wall-base-1').trim(),
  )
  await page.emulateMedia({ colorScheme: 'dark' })
  const nightBase = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--wall-base-1').trim(),
  )

  expect(dayBase).not.toBe(nightBase)
})

test('the page fills the viewport without scrolling', async ({ page }) => {
  await gotoDesktop(page)

  const overflows = await page.evaluate(
    () =>
      document.documentElement.scrollWidth > window.innerWidth ||
      document.documentElement.scrollHeight > window.innerHeight,
  )
  expect(overflows).toBe(false)
})

/**
 * How far from a switched-off screen a wallpaper has to be. Lightness alone does
 * not say it: the Graphite night palette this replaced sat within a point of
 * Monterey's in L*, and one of them is a dark purple while the other was read as
 * a black background. Chroma is the whole of the difference, so the floor is on
 * the two together.
 *
 * Graphite shipped at 19.8 and Ryan called it a black background on 2026-10-07.
 * The three now sit between 36 and 68.
 */
const VISIBLE = 30

/** The middle pixel of a wall, as what a reader sees in it. */
const middleOf = (png: PNG): Look => {
  const lightnesses: number[] = []
  const chromas: number[] = []
  for (let at = 0; at < png.data.length; at += 4 * 13) {
    const look = lookOf([png.data[at], png.data[at + 1], png.data[at + 2]])
    lightnesses.push(look.lightness)
    chromas.push(look.chroma)
  }
  const middle = (list: number[]) => {
    list.sort((one, other) => one - other)
    return list[Math.floor(list.length / 2)]
  }
  return { lightness: middle(lightnesses), chroma: middle(chromas) }
}

for (const wallpaper of wallpapers) {
  for (const theme of ['light', 'dark'] as const) {
    test(`${wallpaper.name} in ${theme} reads as a wallpaper rather than a dark screen`, async ({
      page,
    }) => {
      await chooseAppearance(page, { wallpaper: wallpaper.id, theme })
      await gotoDesktop(page)
      // Anything the desktop draws over the wall would flatter the answer.
      await page.addStyleTag({
        content: 'main > *:not([data-testid="wallpaper"]) { visibility: hidden !important }',
      })

      const seen = middleOf(PNG.sync.read(await page.screenshot()))
      expect(
        seen.lightness + seen.chroma,
        `${wallpaper.name} ${theme}: L* ${seen.lightness.toFixed(1)}, C* ${seen.chroma.toFixed(1)}`,
      ).toBeGreaterThanOrEqual(VISIBLE)
    })
  }
}
