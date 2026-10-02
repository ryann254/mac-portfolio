import { expect, type Locator, test } from '@playwright/test'
import { projects } from '../src/content'
import { HOME } from '../src/desktop/file-tree'
import { routes } from '../src/desktop/routes'
import {
  dockIcon,
  FINDER,
  gotoDesktop,
  openWindow,
  openWindows,
  SAFARI,
  skipBoot,
  windowNamed,
} from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of a window manager',
)

/**
 * Where the address settles once Finder is open. `/finder` names no folder and
 * a Finder window is always in one, so opening it from the dock puts the window
 * in the folder the trail was left in and the address says which.
 */
const AT_HOME = new RegExp(`/finder/${HOME}$`)

/** The same, for Safari, which is always on a project the way Finder is always in a folder. */
const ON_FIRST_PROJECT = new RegExp(`/safari/${projects[0].slug}$`)

const boxOf = async (item: Locator) => {
  const box = await item.boundingBox()
  if (!box) throw new Error('that window is not on screen to be measured')
  return box
}

test('opening an app writes its address without reloading the page', async ({ page }) => {
  await gotoDesktop(page)
  await page.evaluate(() => Object.assign(window, { neverReloaded: true }))

  await openWindow(page, 'Safari', SAFARI)

  await expect(page).toHaveURL(ON_FIRST_PROJECT)
  expect(await page.evaluate(() => 'neverReloaded' in window)).toBe(true)
})

test('back closes the window that was opened, and forward opens it again', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Finder', FINDER)

  await page.goBack()
  await expect(page).toHaveURL(/:\d+\/$/)
  await expect(openWindows(page)).toHaveCount(0)

  await page.goForward()
  await expect(page).toHaveURL(AT_HOME)
  await expect(windowNamed(page, FINDER)).toBeVisible()
})

/**
 * `/finder` grows a second segment the moment the window is up, because Finder
 * is always in a folder. Pushing that instead of replacing it leaves a history
 * entry that settles straight back, and back then goes nowhere.
 */
test('a direct load of `/finder` leaves one entry behind, not two', async ({ page }) => {
  await skipBoot(page)
  await page.goto('/')
  await page.goto('/finder')
  await expect(page).toHaveURL(AT_HOME)

  await page.goBack()
  await expect(page).toHaveURL(/:\d+\/$/)
  await expect(openWindows(page)).toHaveCount(0)
})

test('back with two windows up brings the one underneath to the front', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Finder', FINDER)
  await openWindow(page, 'Safari', SAFARI)
  await expect(page).toHaveURL(ON_FIRST_PROJECT)

  await page.goBack()

  await expect(page).toHaveURL(AT_HOME)
  await expect(windowNamed(page, FINDER)).toHaveAttribute('data-focused', '')
  await expect(openWindows(page)).toHaveCount(2)
})

test('a project address lands with that window open and in front', async ({ page }) => {
  await gotoDesktop(page, '/safari/streamlyne')

  const pane = windowNamed(page, 'Streamlyne')
  await expect(pane).toBeVisible()
  await expect(pane).toHaveAttribute('data-focused', '')
  await expect(pane).toHaveAttribute('data-window', 'safari')
})

test('every address in the registry opens the window it names', async ({ page }) => {
  await skipBoot(page)

  for (const route of routes.filter((route) => route !== '/')) {
    await page.goto(route)
    await expect(openWindows(page), route).toHaveCount(1)
    await expect(openWindows(page), route).toHaveAttribute('data-window', route.split('/')[1])
  }
})

test('the address follows the window in front', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder', FINDER)
  const contact = await openWindow(page, 'Contact')
  await expect(page).toHaveURL(/\/contact$/)

  // Contact is the narrower window, so the strip of Finder down its left is the
  // part of the window behind that a pointer can actually reach.
  const behind = await boxOf(finder)
  const front = await boxOf(contact)
  await page.mouse.click((behind.x + front.x) / 2, behind.y + behind.height / 2)
  await expect(page).toHaveURL(AT_HOME)

  await finder.getByRole('button', { name: `Close ${FINDER}` }).click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(contact).toHaveAttribute('data-focused', '')

  await contact.getByRole('button', { name: 'Close Contact' }).click()
  await expect(page).toHaveURL(/:\d+\/$/)
})

test('back leaves the window where the address it lands on says', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Finder', FINDER)
  await openWindow(page, 'Safari', SAFARI)

  // The folder sends Finder somewhere without opening a window, so it replaces
  // the address rather than pushing one.
  await page.getByRole('navigation', { name: 'Desktop' }).getByText('Projects').click()
  await expect(page).toHaveURL(/\/finder\/projects$/)

  await page.goBack()

  await expect(page).toHaveURL(AT_HOME)
  await expect(windowNamed(page, FINDER)).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL(/:\d+\/$/)
})

test('a folder address titles the window after the folder', async ({ page }) => {
  await gotoDesktop(page, '/finder/projects')

  await expect(windowNamed(page, 'Projects')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close Projects' })).toBeVisible()
})

test('an address nothing answers to opens the 404 window and keeps the address', async ({
  page,
}) => {
  await skipBoot(page)
  const response = await page.goto('/finder/nowhere')

  expect(response?.status()).toBe(404)
  const pane = windowNamed(page, 'File not found')
  await expect(pane.getByRole('heading')).toHaveText('There is nothing at that address')
  await expect(pane.getByRole('link', { name: 'Back to the desktop' })).toHaveAttribute('href', '/')
  await expect(page).toHaveURL(/\/finder\/nowhere$/)
})

test('going back to an address nothing answers to gets the 404 window again', async ({ page }) => {
  await gotoDesktop(page, '/finder/nowhere')
  await openWindow(page, 'Terminal')
  await expect(page).toHaveURL(/\/terminal$/)

  await page.goBack()

  await expect(page).toHaveURL(/\/finder\/nowhere$/)
  await expect(windowNamed(page, 'File not found')).toBeVisible()
})

test('an app the dock does not open a window for has no address', async ({ page }) => {
  await skipBoot(page)

  expect((await page.goto('/launchpad'))?.status()).toBe(404)
  await expect(windowNamed(page, 'File not found')).toBeVisible()
})

test('the dock reopens a window the reader went back past', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Contact')
  await page.goBack()
  await expect(openWindows(page)).toHaveCount(0)

  await dockIcon(page, 'Contact').click()

  await expect(windowNamed(page, 'Contact')).toBeVisible()
  await expect(page).toHaveURL(/\/contact$/)
})
