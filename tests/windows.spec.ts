import { expect, type Locator, type Page, test } from '@playwright/test'
import { handles, MENU_BAR } from '../src/desktop/window-bounds'
import { gotoDesktop } from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of a window manager',
)

const boxOf = async (item: Locator) => {
  const box = await item.boundingBox()
  if (!box) throw new Error('that window is not on screen to be measured')
  return box
}

const dockIcon = (page: Page, name: string) =>
  page.getByTestId('dock').getByRole('button', { name, exact: true })

const windowNamed = (page: Page, name: string) => page.getByRole('region', { name, exact: true })

/**
 * Waits out the open animation. It scales the window up from 94%, so anything
 * measured while it runs is a few pixels short of where the window ends up.
 */
const settled = async (pane: Locator) => {
  await pane.evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished))
  })
}

const openWindow = async (page: Page, name: string) => {
  await dockIcon(page, name).click()
  const pane = windowNamed(page, name)
  await expect(pane).toBeVisible()
  await settled(pane)
  return pane
}

/** Presses at a point, walks to another, and lets go. */
const dragMouse = async (page: Page, from: Locator, dx: number, dy: number, at?: number) => {
  const box = await boxOf(from)
  const x = box.x + (at ?? box.width / 2)
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y + dy, { steps: 12 })
  await page.mouse.up()
}

test('a dock icon opens its window', async ({ page }) => {
  await gotoDesktop(page)
  await expect(page.getByTestId('windows').getByRole('region')).toHaveCount(0)

  const safari = await openWindow(page, 'Safari')

  await expect(safari.getByRole('heading')).toHaveText('Safari opens here once it is built')
  await expect(page.getByTestId('running-safari')).toHaveCSS('opacity', '1')
})

test('opening the same app twice leaves one window', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Safari')
  await dockIcon(page, 'Safari').click()

  await expect(page.getByTestId('windows').getByRole('region')).toHaveCount(1)
})

test('dragging the title bar moves the window by the distance the pointer went', async ({
  page,
}) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const before = await boxOf(finder)

  await dragMouse(page, finder.getByTestId('title-bar'), 140, 90)

  const after = await boxOf(finder)
  expect(after.x - before.x).toBeCloseTo(140, 0)
  expect(after.y - before.y).toBeCloseTo(90, 0)
  expect(after.width).toBeCloseTo(before.width, 0)
  expect(after.height).toBeCloseTo(before.height, 0)
})

test('a flick of the title bar still lands where the pointer let go', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const before = await boxOf(finder)
  const bar = await boxOf(finder.getByTestId('title-bar'))

  // One move and straight up, with no frame in between for React to render in.
  await page.mouse.move(bar.x + 200, bar.y + 15)
  await page.mouse.down()
  await page.mouse.move(bar.x + 260, bar.y + 55)
  await page.mouse.up()

  const after = await boxOf(finder)
  expect(after.x - before.x).toBeCloseTo(60, 0)
  expect(after.y - before.y).toBeCloseTo(40, 0)
})

test('each of the eight handles resizes on its own axis', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')

  for (const handle of handles) {
    const before = await boxOf(finder)
    const dx = handle.includes('e') ? 30 : handle.includes('w') ? -30 : 0
    const dy = handle.includes('n') ? -30 : handle.includes('s') ? 30 : 0

    await dragMouse(page, finder.locator(`[data-handle="${handle}"]`), dx, dy)

    const after = await boxOf(finder)
    expect.soft(Math.round(after.width - before.width), `${handle} width`).toBe(Math.abs(dx))
    expect.soft(Math.round(after.height - before.height), `${handle} height`).toBe(Math.abs(dy))
  }
})

test('the red button closes, the yellow one sends the window to the dock', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const placed = await boxOf(finder)

  await page.getByRole('button', { name: 'Minimise Finder' }).click()
  await expect(finder).toBeHidden()
  await expect(page.getByTestId('running-finder')).toHaveCSS('opacity', '1')

  await dockIcon(page, 'Finder').click()
  await expect(finder).toBeVisible()
  // Coming back out of the dock replays the open animation, because the window
  // left the render tree while it was down.
  await settled(finder)
  expect(await boxOf(finder)).toEqual(placed)

  await page.getByRole('button', { name: 'Close Finder' }).click()
  await expect(finder).toHaveCount(0)
  await expect(page.getByTestId('running-finder')).toHaveCSS('opacity', '0')
})

test('the green button fills the desktop under the menu bar, and gives it back', async ({
  page,
}) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const before = await boxOf(finder)
  const screen = page.viewportSize()
  if (!screen) throw new Error('the test needs a viewport to measure against')

  await page.getByRole('button', { name: 'Maximise Finder' }).click()

  const full = await boxOf(finder)
  expect(full).toMatchObject({ x: 0, y: MENU_BAR, width: screen.width })
  expect(full.height).toBe(screen.height - MENU_BAR)

  await page.getByRole('button', { name: 'Restore Finder' }).click()
  expect(await boxOf(finder)).toEqual(before)
})

test('a double click on the title bar zooms the window and puts it back', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const before = await boxOf(finder)
  const bar = finder.getByTestId('title-bar')

  await bar.dblclick({ position: { x: 240, y: 20 } })
  expect((await boxOf(finder)).width).toBeGreaterThan(before.width)

  await bar.dblclick({ position: { x: 240, y: 20 } })
  expect(await boxOf(finder)).toEqual(before)
})

test('clicking a window behind brings it to the front', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const safari = await openWindow(page, 'Safari')

  const inFront = (pane: Locator) => pane.evaluate((node) => Number(getComputedStyle(node).zIndex))

  expect(await inFront(safari)).toBeGreaterThan(await inFront(finder))

  // Each window opens a step down and right of the last, so the top of Finder's
  // title bar is the strip Safari does not cover.
  const behind = await boxOf(finder)
  const front = await boxOf(safari)
  const clear = (behind.y + front.y) / 2
  expect(clear).toBeLessThan(front.y)

  await page.mouse.click(behind.x + 120, clear)

  await expect.poll(() => inFront(finder)).toBeGreaterThan(await inFront(safari))
  await expect(finder).toHaveAttribute('data-focused', '')
  await expect(safari).not.toHaveAttribute('data-focused', '')
})

test('the keyboard alone opens a window, lands in it, and closes it', async ({ page }) => {
  await gotoDesktop(page)

  // Four desktop folders come first in the tab order, then the dock.
  for (let press = 0; press < 5; press += 1) await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Finder')

  await page.keyboard.press('Enter')
  const finder = windowNamed(page, 'Finder')
  await expect(finder).toBeVisible()
  await expect(finder).toBeFocused()

  await page.keyboard.press('Tab')
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'Close Finder')

  await page.keyboard.press('Escape')
  await expect(finder).toHaveCount(0)
})

test('closing the front window hands the keyboard to the one underneath', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const safari = await openWindow(page, 'Safari')
  await expect(safari).toBeFocused()

  await page.getByRole('button', { name: 'Close Safari' }).click()

  await expect(finder).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(finder).toHaveCount(0)
})

test('minimising the front window hands the keyboard down too', async ({ page }) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  const safari = await openWindow(page, 'Safari')

  await page.getByRole('button', { name: 'Minimise Safari' }).click()

  await expect(finder).toBeFocused()
  await expect(safari).toBeHidden()
})

test('pressing the dock icon of the window already in front puts the keyboard in it', async ({
  page,
}) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')

  await dockIcon(page, 'Finder').click()
  await expect(finder).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(finder).toHaveCount(0)
})

test('pressing the dock icon of a window behind brings it up with the keyboard', async ({
  page,
}) => {
  await gotoDesktop(page)
  const finder = await openWindow(page, 'Finder')
  await openWindow(page, 'Safari')

  await dockIcon(page, 'Finder').click()

  await expect(finder).toBeFocused()
  await expect(finder).toHaveAttribute('data-focused', '')
})

test.describe('on a tablet, with a finger', () => {
  test.use({ viewport: { width: 1024, height: 768 }, hasTouch: true })

  test('the same drag moves the window', async ({ page }) => {
    await gotoDesktop(page)
    const finder = await openWindow(page, 'Finder')
    const before = await boxOf(finder)
    const bar = await boxOf(finder.getByTestId('title-bar'))
    const from = { x: bar.x + bar.width / 2, y: bar.y + bar.height / 2 }

    const touch = await page.context().newCDPSession(page)
    await touch.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: from.x, y: from.y }],
    })
    for (const step of [0.5, 1]) {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: from.x + 100 * step, y: from.y + 60 * step }],
      })
    }
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })

    const after = await boxOf(finder)
    expect(after.x - before.x).toBeCloseTo(100, 0)
    expect(after.y - before.y).toBeCloseTo(60, 0)
  })
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the window is at full size the moment it opens', async ({ page }) => {
    await gotoDesktop(page)
    const finder = await openWindow(page, 'Finder')

    const running = await finder.evaluate((node) => node.getAnimations().length)
    expect(running).toBe(0)
  })
})
