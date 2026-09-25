import { expect, test } from '@playwright/test'
import { gotoDesktop } from './desktop'

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
