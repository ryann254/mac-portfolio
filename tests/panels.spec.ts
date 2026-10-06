import { expect, test } from '@playwright/test'
import { projects } from '../src/content'
import { appById, openableApps } from '../src/desktop/apps'
import { chooseAppearance, gotoDesktop, panelOpener, wallpaperColour } from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of the menu bar and the dock',
)

const launchpadIcon = (page: import('@playwright/test').Page) =>
  page.getByTestId('dock').getByRole('button', { name: 'Launchpad', exact: true })

const spotlightBox = (page: import('@playwright/test').Page) =>
  page.getByRole('combobox', { name: 'Spotlight Search' })

test('the dock opens Launchpad, and the same icon closes it', async ({ page }) => {
  await gotoDesktop(page)

  await launchpadIcon(page).click()
  await expect(page.getByTestId('launchpad-apps')).toBeVisible()

  await launchpadIcon(page).click()
  await expect(page.getByTestId('launchpad-apps')).toBeHidden()
})

test('Launchpad shows every app a reader can open, and nothing they cannot', async ({ page }) => {
  await gotoDesktop(page)
  await launchpadIcon(page).click()

  const tiles = page.getByTestId('launchpad-apps').getByRole('listitem')
  await expect(tiles).toHaveCount(openableApps.length)
  // Launchpad is the grid rather than something in it, and the text and image
  // windows need a file Finder has already picked.
  await expect(page.getByTestId('launchpad-apps')).not.toContainText('Launchpad')
  await expect(page.getByTestId('launchpad-apps')).not.toContainText('TextEdit')
})

test('Launchpad filters as you type, and Enter opens what is left', async ({ page }) => {
  await gotoDesktop(page)
  await launchpadIcon(page).click()

  await page.getByRole('searchbox', { name: 'Search apps' }).fill('term')
  await expect(page.getByTestId('launchpad-apps').getByRole('listitem')).toHaveCount(1)

  await page.getByRole('searchbox', { name: 'Search apps' }).press('Enter')
  await expect(page.getByRole('region', { name: 'Terminal' })).toBeVisible()
  await expect(page).toHaveURL(/\/terminal$/)
  // Opening a window puts the desktop in front, so the panel has done its job.
  await expect(page.getByTestId('launchpad-apps')).toBeHidden()
})

test('Enter on an app that leaves the site opens the tab rather than a window', async ({
  page,
}) => {
  await gotoDesktop(page)
  await launchpadIcon(page).click()
  await page.getByRole('searchbox', { name: 'Search apps' }).fill('git')

  const [tab] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('searchbox', { name: 'Search apps' }).press('Enter'),
  ])
  expect(tab.url()).toBe(appById('github').href)
})

test('Launchpad says so when nothing is called that', async ({ page }) => {
  await gotoDesktop(page)
  await launchpadIcon(page).click()

  await page.getByRole('searchbox', { name: 'Search apps' }).fill('fortran')
  await expect(page.getByTestId('launchpad-apps')).toBeHidden()
  await expect(page.getByText('Nothing here is called that.')).toBeVisible()
})

test('Cmd+K opens Spotlight and Escape closes it', async ({ page }) => {
  await gotoDesktop(page)

  await page.keyboard.press('ControlOrMeta+k')
  await expect(spotlightBox(page)).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(spotlightBox(page)).toBeHidden()
})

test('Spotlight puts an exact app name first and opens it', async ({ page }) => {
  await gotoDesktop(page)
  await panelOpener(page, 'spotlight').click()

  await spotlightBox(page).fill('Photos')
  const rows = page.getByRole('option')
  await expect(rows.first()).toContainText('Photos')
  await expect(rows.first()).toHaveAttribute('aria-selected', 'true')

  await spotlightBox(page).press('Enter')
  await expect(page.getByRole('region', { name: 'Photos' })).toBeVisible()
  await expect(page).toHaveURL(/\/photos$/)
  // The keyboard goes where the window went, so Escape closes what was opened.
  await expect(page.getByRole('region', { name: 'Photos' })).toBeFocused()
})

test('Spotlight finds a project by a stack tag and opens Safari on it', async ({ page }) => {
  await gotoDesktop(page)
  await panelOpener(page, 'spotlight').click()

  const [flutter] = projects.filter((project) => project.stack.includes('Flutter'))
  await spotlightBox(page).fill('Flutter')
  await expect(page.getByRole('option').first()).toContainText(flutter.name)

  await page.getByRole('option').first().click()
  await expect(page).toHaveURL(new RegExp(`/safari/${flutter.slug}$`))
})

test('the arrow keys walk the results while the keyboard stays in the box', async ({ page }) => {
  await gotoDesktop(page)
  await page.keyboard.press('ControlOrMeta+k')
  await spotlightBox(page).fill('React')

  await expect(page.getByRole('option').nth(0)).toHaveAttribute('aria-selected', 'true')
  await page.keyboard.press('ArrowDown')
  await expect(page.getByRole('option').nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect(spotlightBox(page)).toBeFocused()

  await page.keyboard.press('ArrowUp')
  await expect(page.getByRole('option').nth(0)).toHaveAttribute('aria-selected', 'true')
})

test('Spotlight says so when nothing is called that', async ({ page }) => {
  await gotoDesktop(page)
  await panelOpener(page, 'spotlight').click()

  await spotlightBox(page).fill('fortran')
  await expect(page.getByRole('listbox')).toBeHidden()
  await expect(page.getByText('Nothing here is called that.')).toBeVisible()
})

test('pressing the desktop behind a panel closes it', async ({ page }) => {
  await gotoDesktop(page)
  await panelOpener(page, 'control-centre').click()
  await expect(page.getByTestId('control-centre')).toBeVisible()

  await page.getByTestId('panel-backdrop').click({ position: { x: 300, y: 500 } })
  await expect(page.getByTestId('control-centre')).toBeHidden()
})

test('the Control Centre icon opens its sheet and closes it again', async ({ page }) => {
  await gotoDesktop(page)

  await panelOpener(page, 'control-centre').click()
  await expect(page.getByTestId('control-centre')).toBeVisible()

  await panelOpener(page, 'control-centre').click()
  await expect(page.getByTestId('control-centre')).toBeHidden()
})

test('dark mode holds over a reload, and over a system that says light', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await gotoDesktop(page)
  const day = await wallpaperColour(page)

  await panelOpener(page, 'control-centre').click()
  await page.locator('[data-theme-choice="dark"]').click()
  const night = await wallpaperColour(page)
  expect(night).not.toBe(day)

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  expect(await wallpaperColour(page)).toBe(night)
})

test('the wallpaper choice holds over a reload', async ({ page }) => {
  await gotoDesktop(page)
  const monterey = await wallpaperColour(page)

  await panelOpener(page, 'control-centre').click()
  await page.locator('[data-wallpaper-choice="graphite"]').click()
  const graphite = await wallpaperColour(page)
  expect(graphite).not.toBe(monterey)

  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-wallpaper', 'graphite')
  expect(await wallpaperColour(page)).toBe(graphite)
})

test('the brightness holds over a reload and dims the whole screen', async ({ page }) => {
  await gotoDesktop(page)
  const dim = page.locator('[data-dim]')
  await expect(dim).toHaveCSS('opacity', '0')

  await panelOpener(page, 'control-centre').click()
  await page.getByRole('slider', { name: 'Brightness' }).fill('40')
  await expect(dim).toHaveCSS('opacity', '0.45')

  await page.reload()
  await expect(dim).toHaveCSS('opacity', '0.45')
})

test('a wallpaper chosen last time is painted before any of this runs', async ({ page }) => {
  await chooseAppearance(page, { wallpaper: 'tide', theme: 'dark' })
  await gotoDesktop(page)

  // The attributes are on the element in the first paint, which is the script
  // in the layout rather than React.
  await expect(page.locator('html')).toHaveAttribute('data-wallpaper', 'tide')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})
