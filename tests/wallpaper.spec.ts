import { expect, test } from '@playwright/test'

test('the desktop paints its wallpaper', async ({ page }) => {
  await page.goto('/')

  const wallpaper = page.getByTestId('wallpaper')
  await expect(wallpaper).toBeVisible()
  await expect(wallpaper).toHaveAccessibleName(/wallpaper/i)
})

test('the desktop names who it belongs to', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ryan Waweru')
  await expect(page.getByText('Senior Frontend Engineer')).toBeVisible()
})

test('the page fills the viewport without scrolling', async ({ page }) => {
  await page.goto('/')

  const overflows = await page.evaluate(
    () =>
      document.documentElement.scrollWidth > window.innerWidth ||
      document.documentElement.scrollHeight > window.innerHeight,
  )
  expect(overflows).toBe(false)
})
