import { expect, type Page, test } from '@playwright/test'
import { profile } from '../src/content'
import { gotoDesktop, panelOpener } from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of the menu bar and the dock',
)

const appleItem = async (page: Page, label: string) => {
  await panelOpener(page, 'apple').click()
  await page
    .getByRole('navigation', { name: 'Apple menu' })
    .getByRole('button', { name: label })
    .click()
}

test('About This Site says what the site is made of, and closes', async ({ page }) => {
  await gotoDesktop(page)

  await appleItem(page, 'About This Site')
  const about = page.getByTestId('about-this-site')
  await expect(about).toContainText(profile.name)
  await expect(about).toContainText('Next.js')
  // The credit the README carries, where a reader who never opens the repo sees it.
  await expect(about.getByRole('link', { name: /danielprior-macos/ })).toHaveAttribute(
    'target',
    '_blank',
  )

  await about.getByRole('button', { name: 'Close' }).click()
  await expect(about).toBeHidden()
})

test('Sleep darkens the screen and anything brings it back', async ({ page }) => {
  await gotoDesktop(page)

  await appleItem(page, 'Sleep')
  const dark = page.getByTestId('dark-screen')
  await expect(dark).toBeVisible()
  await expect(dark).toContainText('wake')
  await expect(dark).toBeFocused()

  await dark.click()
  await expect(dark).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('Lock Screen shows who is logged out, and logs back in', async ({ page }) => {
  await gotoDesktop(page)

  await appleItem(page, 'Lock Screen')
  const lock = page.getByTestId('lock-screen')
  await expect(lock).toBeVisible()
  await expect(lock).toContainText(profile.name)

  await lock.getByRole('button', { name: 'Log in' }).click()
  await expect(lock).toBeHidden()
})

test('Shut Down leaves a screen only the power turns back on', async ({ page }) => {
  await gotoDesktop(page)

  await appleItem(page, 'Shut Down')
  const dark = page.getByTestId('dark-screen')
  await expect(dark).toContainText('turn on')

  await dark.press('Enter')
  // Turning it back on is a boot rather than a wake, so the curtain plays again.
  await expect(page.getByTestId('boot')).toBeVisible()
  await expect(page.getByTestId('boot')).toBeHidden({ timeout: 5_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('Restart replays the boot and lands back on the desktop', async ({ page }) => {
  await gotoDesktop(page)
  // The session has already watched one boot, which is what makes this a replay
  // rather than the first one.
  await expect(page.getByTestId('boot')).toBeHidden()

  await appleItem(page, 'Restart')
  await expect(page.getByTestId('boot')).toBeVisible()
  const bar = page.getByTestId('boot-bar')
  expect(await bar.evaluate((node) => node.getAnimations().length)).toBe(1)

  await expect(page.getByTestId('boot')).toBeHidden({ timeout: 5_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('the Apple menu opens and closes on the keyboard alone', async ({ page }) => {
  await gotoDesktop(page)

  await panelOpener(page, 'apple').focus()
  await page.keyboard.press('Enter')
  const menu = page.getByRole('navigation', { name: 'Apple menu' })
  await expect(menu).toBeVisible()
  await expect(panelOpener(page, 'apple')).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  // The keyboard comes back to what opened it, rather than to the top of the page.
  await expect(panelOpener(page, 'apple')).toBeFocused()
})
