import { expect, type Locator, test } from '@playwright/test'
import { dockApps, offsiteApps } from '../src/desktop/apps'
import { gotoDesktop, tabToTheDock } from './desktop'

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

test('the dock holds every app a reader can start from it', async ({ page }) => {
  await gotoDesktop(page)

  /* Not every app in the registry: the text and image windows are opened by
     Finder on a file, and a dock icon carries no file to open one on. */
  const items = page.getByTestId('dock').locator('[data-dock-item]')
  await expect(items).toHaveCount(dockApps.length + offsiteApps.length)
})

test('the icon under the pointer grows, and the ones beside it less so', async ({
  page,
  isMobile,
}) => {
  test.skip(
    Boolean(isMobile),
    'a phone has no pointer to hover, and the dock there does not magnify',
  )
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

test('the keyboard reaches the dock and opens an app', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'under 768px the home screen comes between the bar and the dock')
  await gotoDesktop(page)

  // The menu bar comes first in the tab order, then the four desktop folders,
  // then the dock. It should stay a short walk whatever else lands up there.
  // A phone has a home screen of eight apps in between, so the walk there is a
  // different one and `tests/mobile.spec.ts` holds it.
  expect(await tabToTheDock(page)).toBeLessThanOrEqual(8)

  const focused = page.locator(':focus')
  await expect(focused).toHaveAttribute('aria-label', 'Finder')
  await expect(focused.getByText('Finder')).toBeVisible()

  await page.keyboard.press('Enter')
  /* Finder is titled by the folder it opens in, which is the first in its sidebar. */
  await expect(page.getByRole('region', { name: 'Intro' })).toBeVisible()
})

test('the offsite apps say they leave the site', async ({ page, isMobile }) => {
  test.skip(
    Boolean(isMobile),
    'under 768px the dock keeps four apps and the home screen carries these two',
  )
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
