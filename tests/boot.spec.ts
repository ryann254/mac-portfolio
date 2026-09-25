import { expect, test } from '@playwright/test'
import { BOOTED_KEY } from '../src/desktop/boot-state'

test('the boot screen is in the server response, before any JavaScript runs', async ({
  request,
}) => {
  const html = await (await request.get('/')).text()

  expect(html).toContain('data-boot=""')
  expect(html).toContain('data-boot-bar=""')
  // The desktop is in the same response, painting underneath, which is what
  // lets the reader land on a finished desktop when the curtain lifts.
  expect(html).toContain('Ryan Waweru')
})

test('the boot covers the desktop and then lifts', async ({ page }) => {
  await page.goto('/')

  const boot = page.getByTestId('boot')
  await expect(boot).toBeVisible()
  await expect(boot).toBeHidden({ timeout: 5_000 })
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('a keypress skips the boot', async ({ page }) => {
  await page.goto('/')

  const boot = page.getByTestId('boot')
  await expect(boot).toBeVisible()
  await page.keyboard.press('Space')
  await expect(boot).toBeHidden({ timeout: 1_000 })
})

test('a click skips the boot', async ({ page }) => {
  await page.goto('/')

  const boot = page.getByTestId('boot')
  await expect(boot).toBeVisible()
  await page.mouse.click(700, 400)
  await expect(boot).toBeHidden({ timeout: 1_000 })
})

test('a reload in the same session goes straight to the desktop', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('boot')).toBeHidden({ timeout: 5_000 })
  expect(await page.evaluate((key) => sessionStorage.getItem(key), BOOTED_KEY)).toBe('yes')

  await page.reload()

  // Hidden from the first paint, not hidden a moment later: the inline script
  // in the layout has to beat React to it or the boot flashes on every reload.
  await expect(page.getByTestId('boot')).toBeHidden()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('a new session boots again', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.getByTestId('boot')).toBeVisible()
  await context.close()
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the boot still ends, without animating the bar', async ({ page }) => {
    await page.goto('/')

    const bar = page.getByTestId('boot-bar')
    await expect(bar).toHaveCSS('animation-name', 'boot-hold')
    await expect(page.getByTestId('boot')).toBeHidden({ timeout: 5_000 })
  })
})
