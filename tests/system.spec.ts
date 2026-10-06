import { expect, type Page, test } from '@playwright/test'
import { profile } from '../src/content'
import { contrastRatio, type Rgb, requiredRatio } from '../src/lib/contrast'
import { gotoDesktop, panelOpener } from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of the menu bar and the dock',
)

/** Whether the boot bar is part way across its track, which is a boot playing. */
const filling = (page: Page) =>
  page.getByTestId('boot-bar').evaluate((node) => {
    const bar = node.getBoundingClientRect().width
    const track = (node.parentElement as HTMLElement).getBoundingClientRect().width
    return bar > 0 && bar < track
  })

const appleItem = async (page: Page, label: string) => {
  await panelOpener(page, 'apple').click()
  await page.getByRole('list', { name: 'Apple menu' }).getByRole('button', { name: label }).click()
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

test('the one line on a dark screen is bright enough to read', async ({ page }) => {
  await gotoDesktop(page)
  await appleItem(page, 'Sleep')

  // Nothing else is on that screen to carry the words, so they have to clear
  // 4.5:1 on their own. Lighthouse never sees this: it only ever loads `/`.
  const ink = await page.getByTestId('dark-screen').evaluate(onBlack)
  expect(contrastRatio(ink, BLACK)).toBeGreaterThanOrEqual(requiredRatio(false))
})

const BLACK: Rgb = [0, 0, 0]

/**
 * The colour the words land in, which is a half-transparent white over black.
 * A canvas does the compositing, and the colour space: Tailwind writes these as
 * `oklab(... / .55)` and reading the string back would mean parsing that.
 */
const onBlack = (node: Element): Rgb => {
  const canvas = document.createElement('canvas')
  const ink = canvas.getContext('2d')
  if (!ink) throw new Error('this browser has no 2d canvas to mix the colour in')
  ink.fillStyle = 'black'
  ink.fillRect(0, 0, 1, 1)
  ink.fillStyle = getComputedStyle(node).color
  ink.fillRect(0, 0, 1, 1)
  const [red, green, blue] = ink.getImageData(0, 0, 1, 1).data
  return [red, green, blue]
}

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
  // The bar has to be caught part way: a curtain that is merely up for a frame
  // is what this looked like before the machine learned the difference between
  // the boot a page starts with and one the reader asked for.
  await expect(page.getByTestId('boot')).toBeVisible()
  await page.waitForTimeout(400)
  expect(await filling(page)).toBe(true)

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
  const menu = page.getByRole('list', { name: 'Apple menu' })
  await expect(menu).toBeVisible()
  await expect(panelOpener(page, 'apple')).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  // The keyboard comes back to what opened it, rather than to the top of the page.
  await expect(panelOpener(page, 'apple')).toBeFocused()
})
