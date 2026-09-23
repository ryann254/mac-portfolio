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

test('the desktop leads to every section', async ({ page }) => {
  await page.goto('/')

  for (const label of ['About', 'Experience', 'Projects', 'Skills', 'Contact']) {
    await expect(page.getByRole('link', { name: label })).toBeVisible()
  }

  await page.getByRole('link', { name: 'Projects' }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Projects')
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
