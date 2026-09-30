import { expect, type Locator, test } from '@playwright/test'
import { routes } from '../src/desktop/routes'
import { dockIcon, gotoDesktop, openWindow, openWindows, skipBoot, windowNamed } from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of a window manager',
)

const boxOf = async (item: Locator) => {
  const box = await item.boundingBox()
  if (!box) throw new Error('that window is not on screen to be measured')
  return box
}

test('opening an app writes its address without reloading the page', async ({ page }) => {
  await gotoDesktop(page)
  await page.evaluate(() => Object.assign(window, { neverReloaded: true }))

  await openWindow(page, 'Safari')

  await expect(page).toHaveURL(/\/safari$/)
  expect(await page.evaluate(() => 'neverReloaded' in window)).toBe(true)
})

test('back closes the window that was opened, and forward opens it again', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Finder')

  await page.goBack()
  await expect(page).toHaveURL(/:\d+\/$/)
  await expect(openWindows(page)).toHaveCount(0)

  await page.goForward()
  await expect(page).toHaveURL(/\/finder$/)
  await expect(windowNamed(page, 'Finder')).toBeVisible()
})

test('back with two windows up brings the one underneath to the front', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Finder')
  await openWindow(page, 'Safari')
  await expect(page).toHaveURL(/\/safari$/)

  await page.goBack()

  await expect(page).toHaveURL(/\/finder$/)
  await expect(windowNamed(page, 'Finder')).toHaveAttribute('data-focused', '')
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
  const finder = await openWindow(page, 'Finder')
  const contact = await openWindow(page, 'Contact')
  await expect(page).toHaveURL(/\/contact$/)

  // Contact is the narrower window, so the strip of Finder down its left is the
  // part of the window behind that a pointer can actually reach.
  const behind = await boxOf(finder)
  const front = await boxOf(contact)
  await page.mouse.click((behind.x + front.x) / 2, behind.y + behind.height / 2)
  await expect(page).toHaveURL(/\/finder$/)

  await finder.getByRole('button', { name: 'Close Finder' }).click()
  await expect(page).toHaveURL(/\/contact$/)
  await expect(contact).toHaveAttribute('data-focused', '')

  await contact.getByRole('button', { name: 'Close Contact' }).click()
  await expect(page).toHaveURL(/:\d+\/$/)
})

test('back leaves the window where the address it lands on says', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Finder')
  await openWindow(page, 'Safari')

  // The folder sends Finder somewhere without opening a window, so it replaces
  // the address rather than pushing one.
  await page.getByRole('navigation', { name: 'Desktop' }).getByText('Projects').click()
  await expect(page).toHaveURL(/\/finder\/projects$/)

  await page.goBack()

  await expect(page).toHaveURL(/\/finder$/)
  await expect(windowNamed(page, 'Finder')).toBeVisible()

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
  await expect(pane.getByRole('heading')).toHaveText('Nothing answers to that address')
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
