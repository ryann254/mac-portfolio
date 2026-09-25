import { expect, type Locator, test } from '@playwright/test'
import { apps } from '../src/desktop/apps'
import { gotoDesktop } from './desktop'

const widthOf = async (item: Locator): Promise<number> => {
  const box = await item.boundingBox()
  if (!box) throw new Error('the dock item has no box to measure')
  return box.width
}

const hoverCentre = async (item: Locator): Promise<void> => {
  const box = await item.boundingBox()
  if (!box) throw new Error('the dock item has no box to hover')
  await item.page().mouse.move(box.x + box.width / 2, box.y + box.height / 2)
}

test('the dock holds every app in the registry', async ({ page }) => {
  await gotoDesktop(page)

  const items = page.getByTestId('dock').locator('[data-dock-item]')
  await expect(items).toHaveCount(apps.length)
})

test('the icon under the pointer grows, and the ones beside it less so', async ({ page }) => {
  await gotoDesktop(page)

  const safari = page.getByTestId('dock').getByRole('button', { name: 'Safari' })
  const terminal = page.getByTestId('dock').getByRole('button', { name: 'Terminal' })
  const resting = await widthOf(safari)

  await hoverCentre(safari)

  await expect.poll(() => widthOf(safari)).toBeGreaterThan(resting * 1.4)
  const neighbour = await widthOf(terminal)
  expect(neighbour).toBeGreaterThan(resting)
  expect(neighbour).toBeLessThan(await widthOf(safari))
})

test('the dock rests again when the pointer leaves', async ({ page }) => {
  await gotoDesktop(page)

  const safari = page.getByTestId('dock').getByRole('button', { name: 'Safari' })
  const resting = await widthOf(safari)

  await hoverCentre(safari)
  await expect.poll(() => widthOf(safari)).toBeGreaterThan(resting)
  await page.mouse.move(20, 400)

  await expect.poll(() => widthOf(safari)).toBe(resting)
})

test('the dock shows what an icon is on hover', async ({ page }) => {
  await gotoDesktop(page)

  const safari = page.getByTestId('dock').getByRole('button', { name: 'Safari' })
  await hoverCentre(safari)

  await expect(safari.getByText('Safari')).toBeVisible()
})

test('the keyboard reaches the dock and opens an app', async ({ page }) => {
  await gotoDesktop(page)

  // Four desktop folders come first in the tab order, then the dock.
  for (let press = 0; press < 5; press += 1) await page.keyboard.press('Tab')

  const focused = page.locator(':focus')
  await expect(focused).toHaveAttribute('aria-label', 'Finder')
  await expect(focused.getByText('Finder')).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(page.getByRole('region', { name: 'Finder' })).toBeVisible()
})

test('the offsite apps say they leave the site', async ({ page }) => {
  await gotoDesktop(page)

  const github = page.getByTestId('dock').getByRole('link', { name: /GitHub/ })
  await expect(github).toHaveAttribute('target', '_blank')
  await expect(github).toHaveAttribute('href', 'https://github.com/ryann254')
  await expect(github).toHaveAccessibleName('GitHub, opens in a new tab')
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the icons stay the size they were', async ({ page }) => {
    await gotoDesktop(page)

    const safari = page.getByTestId('dock').getByRole('button', { name: 'Safari' })
    const resting = await widthOf(safari)

    await hoverCentre(safari)
    await page.waitForTimeout(250)

    expect(await widthOf(safari)).toBe(resting)
  })
})
