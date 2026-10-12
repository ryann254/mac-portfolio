import { expect, test } from '@playwright/test'
import { addressedApps, appById, apps, offsiteApps, openableApps } from '../src/desktop/apps'
import { firstShowing, routes, targetAt, windowTitle } from '../src/desktop/routes'
import { gotoDesktop, settled, windowNamed } from './desktop'

/**
 * The phone. Everything here runs at 390x844 and nowhere else, the mirror of
 * the `isMobile` skip the desktop specs carry: those two lines are the whole of
 * which layout a test is about.
 *
 * There is no second set of components to test. A phone is this desktop with
 * its top bar restyled, a home screen where the folders were, and every window
 * filling the screen, so what is checked here is that those three things happen
 * and that nothing the desktop owns leaks through at this width.
 */
test.skip(({ isMobile }) => !isMobile, 'the home screen only exists under 768px')

const home = (page: Parameters<typeof gotoDesktop>[0]) => page.getByTestId('home-screen')

test('the home screen carries every app the dock and Launchpad do', async ({ page }) => {
  await gotoDesktop(page)

  await expect(home(page)).toBeVisible()
  await expect(home(page).locator('[data-home-item]')).toHaveCount(openableApps.length)
  for (const app of openableApps) {
    await expect(home(page).locator(`[data-home-item="${app.id}"]`)).toBeVisible()
  }
})

test('the desktop itself is not drawn at this width', async ({ page }) => {
  await gotoDesktop(page)

  // The folders, the menus and the Apple menu are a pointer's desktop. The
  // welcome stays, because it is what says whose site this is.
  await expect(page.getByRole('navigation', { name: 'Desktop' })).toBeHidden()
  await expect(page.getByTestId('menu-bar-app')).toBeHidden()
  await expect(page.locator('[data-panel-opener="apple"]')).toBeHidden()
  await expect(page.getByTestId('welcome-role')).toBeVisible()
  await expect(page.getByTestId('menu-clock')).toBeVisible()
})

test('every app opens full screen from the home screen, and Done gives it back', async ({
  page,
}) => {
  const size = page.viewportSize()
  if (!size) throw new Error('this test needs a viewport to measure against')

  for (const app of addressedApps) {
    await gotoDesktop(page)
    await home(page).locator(`[data-home-item="${app.id}"]`).click()

    const pane = page.getByTestId('window').first()
    await expect(pane).toBeVisible()
    // The window eases up from 94%, and anything measured while that runs is a
    // few pixels short of the screen it ends up filling.
    await settled(pane)
    const box = await pane.boundingBox()
    if (!box) throw new Error(`${app.name} opened off screen`)

    expect(box.width, `${app.name} fills the width`).toBeCloseTo(size.width, 0)
    expect(box.x, `${app.name} starts at the left edge`).toBeCloseTo(0, 0)
    expect(box.y + box.height, `${app.name} reaches the bottom`).toBeCloseTo(size.height, 0)

    // The dock is under the app, so it steps aside until the app is closed.
    await expect(page.getByTestId('dock')).toBeHidden()

    await pane.locator('[data-done]').click()
    await expect(page.getByTestId('window')).toHaveCount(0)
    await expect(page.getByTestId('dock')).toBeVisible()
  }
})

test('an offsite app on the home screen opens a tab that cannot reach this one', async ({
  page,
}) => {
  await gotoDesktop(page)

  for (const app of offsiteApps) {
    const tile = home(page).locator(`[data-home-item="${app.id}"]`)
    await expect(tile).toHaveAttribute('href', app.href ?? '')
    await expect(tile).toHaveAttribute('target', '_blank')
    await expect(tile).toHaveAttribute('rel', /noopener/)
  }
})

test('every address opens the window it names, the same as on a desktop', async ({ page }) => {
  for (const route of routes) {
    // `/` is the desktop with nothing open, which on a phone is the home screen.
    const target = targetAt(route)
    if (!target) continue

    /* `/finder` and `/safari` name no folder and no project, and a window of
       either is always in one, so both settle onto the first thing the app has
       and the window wears that name rather than the app's. */
    const landed = { ...target, showing: target.showing ?? firstShowing(target.app) }

    await gotoDesktop(page, route)
    await expect(windowNamed(page, windowTitle(landed)), route).toBeVisible()
  }
})

test('nothing runs off the side at 390px', async ({ page }) => {
  const screens = ['/', ...routes]

  for (const screen of screens) {
    await gotoDesktop(page, screen)
    const overflow = await page.evaluate(() => ({
      scrolled: document.documentElement.scrollWidth,
      shown: document.documentElement.clientWidth,
    }))
    expect(overflow.scrolled, `${screen} scrolls sideways`).toBeLessThanOrEqual(overflow.shown)
  }
})

test('Spotlight and Control Centre are still reachable with no menu bar', async ({ page }) => {
  await gotoDesktop(page)

  await page.locator('[data-panel-opener="spotlight"]').click()
  await expect(page.getByTestId('panel')).toBeVisible()
  await page.keyboard.press('Escape')

  await page.locator('[data-panel-opener="control-centre"]').click()
  await expect(page.getByTestId('panel')).toBeVisible()
})

test('a window has no handles to drag or resize it by', async ({ page }) => {
  await gotoDesktop(page, '/terminal')

  const pane = windowNamed(page, appById('terminal').name)
  await expect(pane).toBeVisible()
  await expect(pane.locator('[data-handle]')).toHaveCount(0)
  await expect(pane.getByRole('button', { name: /Minimise|Maximise/ })).toHaveCount(0)
})

/**
 * The keyboard path a phone has instead of the desktop's, which `dock.spec.ts`
 * holds: there the walk is menu bar, folders, dock, and here the home screen is
 * what sits in between.
 */
test('a keyboard alone reaches the home screen and opens an app', async ({ page }) => {
  await gotoDesktop(page)

  const finder = home(page).locator('[data-home-item="finder"]')
  await finder.focus()
  await expect(finder).toBeFocused()

  await page.keyboard.press('Enter')
  await expect(page.getByTestId('window').first()).toBeVisible()
})

test('the dock keeps only the apps worth a permanent row', async ({ page }) => {
  await gotoDesktop(page)
  const pinned = apps.filter((app) => app.pinned)

  const dock = page.getByTestId('dock')
  await expect(dock.locator('[data-dock-item]:visible')).toHaveCount(pinned.length)
  for (const app of pinned) {
    await expect(dock.getByRole('button', { name: app.name })).toBeVisible()
  }
})
