import { expect, test } from '@playwright/test'
import { gotoDesktop } from './desktop'

const AT = new Date('2026-09-24T18:41:00')

test('the menu bar reads the wall clock', async ({ page }) => {
  await page.clock.install({ time: AT })
  await gotoDesktop(page)

  await expect(page.getByTestId('menu-clock')).toHaveText('Thu 24 Sep 6:41 PM')
})

test('both clocks show the same minute', async ({ page }) => {
  await page.clock.install({ time: AT })
  await gotoDesktop(page)

  const desk = page.getByTestId('desk-clock')
  await expect(desk).toContainText('THU · SEP 24')
  expect((await desk.textContent())?.replace(/\D/g, '')).toContain('0641')
  await expect(page.getByTestId('menu-clock')).toContainText('6:41')
})

test('the menu bar keeps up with the minute turning over', async ({ page }) => {
  await page.clock.install({ time: AT })
  await gotoDesktop(page)
  await expect(page.getByTestId('menu-clock')).toHaveText('Thu 24 Sep 6:41 PM')

  await page.clock.fastForward('01:00')

  await expect(page.getByTestId('menu-clock')).toHaveText('Thu 24 Sep 6:42 PM')
})

test('the desktop folders lead to the content', async ({ page }) => {
  await gotoDesktop(page)

  const folders = page.getByRole('navigation', { name: 'Desktop' }).getByRole('link')
  await expect(folders).toHaveText(['Intro', 'Projects', 'Work Experience', 'Contacts'])

  await folders.filter({ hasText: 'Work Experience' }).click()
  await expect(page).toHaveURL(/\/experience$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Experience')
})

test('the desktop names who it belongs to', async ({ page }) => {
  await gotoDesktop(page)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ryan Waweru')
  await expect(page.getByTestId('welcome-role')).toHaveText('Senior Frontend Engineer')
  await expect(page.getByTestId('welcome-tagline')).toContainText('6+ years of React')
})

test('the clock never ends up behind the dock', async ({ page }) => {
  await gotoDesktop(page)

  for (const width of [768, 1024, 1180, 1280, 1366, 1440, 1512]) {
    await page.setViewportSize({ width, height: 800 })
    const clock = await page.getByTestId('desk-clock').boundingBox()
    if (!clock) continue

    // The rightmost icon at full magnification reaches past the dock's own box,
    // so the dock's reach is measured with the pointer on it. The pointer is
    // parked first, because the icon keeps the size the last hover left it.
    const linkedin = page.getByTestId('dock').getByRole('link', { name: /LinkedIn/ })
    await page.mouse.move(4, 4)
    await page.waitForTimeout(250)
    const resting = await linkedin.boundingBox()
    if (!resting) throw new Error('the dock has no LinkedIn icon to measure')
    await page.mouse.move(resting.x + resting.width / 2, resting.y + resting.height / 2)
    await expect
      .poll(async () => (await linkedin.boundingBox())?.width)
      .toBeGreaterThan(resting.width)
    const magnified = await linkedin.boundingBox()
    if (!magnified) throw new Error('the dock icon vanished while being measured')

    const dock = await page.getByTestId('dock').boundingBox()
    if (!dock) throw new Error('the dock has no box to measure')
    const reachesRightTo = Math.max(dock.x + dock.width, magnified.x + magnified.width)
    const reachesUpTo = Math.min(dock.y, magnified.y)

    const overlaps = clock.x < reachesRightTo && clock.y + clock.height > reachesUpTo
    expect(overlaps, `the clock and the dock collide at ${width}px`).toBe(false)
  }
})
