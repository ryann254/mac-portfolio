import { expect, type Page, test } from '@playwright/test'
import { openableApps } from '../src/desktop/apps'
import { gotoDesktop, openWindows } from './desktop'

/**
 * Reduced motion, swept rather than spot-checked. The other specs each prove
 * their own corner of it; this one walks every element on the page and asks the
 * browser what it would animate, so a `transition` added anywhere without the
 * `motion-safe:` in front of it is caught here rather than by a reader who set
 * the preference because motion makes them ill.
 */

/**
 * The one animation allowed to keep a duration. The boot bar's `animationend`
 * is what tells React the boot is over, so under reduced motion it swaps the
 * fill for keyframes that hold the bar at full width: the event still fires and
 * nothing moves. The last test proves the second half of that.
 */
const HOLDS = 'boot-hold'

/** Every element the browser would animate or ease, named so a failure says which. */
const whatMoves = (page: Page): Promise<readonly string[]> =>
  page.evaluate((holds) => {
    const longest = (value: string): number =>
      value
        .split(',')
        .map((part) => {
          const time = part.trim()
          return time.endsWith('ms') ? Number.parseFloat(time) / 1000 : Number.parseFloat(time)
        })
        .reduce((most, one) => Math.max(most, Number.isFinite(one) ? one : 0), 0)

    const named = (node: Element, why: string, what: string): string => {
      const id = node.getAttribute('data-testid') ?? node.className.toString().slice(0, 40)
      return `${node.tagName.toLowerCase()} (${id}) ${why} ${what}`
    }

    const moving: string[] = []
    for (const node of document.querySelectorAll('*')) {
      const style = getComputedStyle(node)
      const names = style.animationName.split(',').map((one) => one.trim())

      if (longest(style.animationDuration) > 0 && !names.every((one) => one === holds)) {
        moving.push(named(node, 'animates', style.animationName))
      }
      if (longest(style.transitionDuration) > 0) {
        moving.push(named(node, 'eases', style.transitionProperty))
      }
    }
    return moving
  }, HOLDS)

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('nothing on the desktop would animate', async ({ page }) => {
    await gotoDesktop(page)
    expect(await whatMoves(page)).toEqual([])
  })

  test('nothing in any app would animate', async ({ page }) => {
    for (const app of openableApps.filter((one) => one.href === undefined)) {
      await gotoDesktop(page, `/${app.id}`)
      await expect(openWindows(page).first()).toBeVisible()
      expect(await whatMoves(page), app.name).toEqual([])
    }
  })

  test('nothing in a panel would animate', async ({ page }) => {
    await gotoDesktop(page)

    for (const panel of ['spotlight', 'control-centre']) {
      await page.locator(`[data-panel-opener="${panel}"]`).click()
      await expect(page.getByTestId('panel')).toBeVisible()
      expect(await whatMoves(page), panel).toEqual([])
      await page.keyboard.press('Escape')
    }
  })

  test('nothing a file opens would animate', async ({ page }) => {
    await gotoDesktop(page, '/finder/experience')
    await page.locator('[data-file^="experience/"]').first().dblclick()
    await expect(openWindows(page)).toHaveCount(2)

    expect(await whatMoves(page)).toEqual([])
  })

  /**
   * Why the one exception above is allowed. Read off the stylesheet rather than
   * by watching the bar, because the boot is over in 300ms under reduced motion
   * and sampling a width twice races it: under load the second sample lands
   * after the curtain has gone and measures nothing.
   */
  test('the boot bar holds still, which is why it keeps its duration', async ({ page }) => {
    await page.goto('/')

    /* Found and read in one step. The bar is keyed on the state, so the end of
       the boot replaces the element rather than changing it, and a handle taken
       before that answers "" for every computed style afterwards: a locator
       resolved and then read a moment later fails on a loaded machine as though
       the bar had been on the wrong keyframes. */
    const name = await page.evaluate(() => {
      const bar = document.querySelector('[data-boot-bar]')
      return bar === null ? 'no boot bar on the page' : getComputedStyle(bar).animationName
    })
    expect(name, 'the bar is not on the keyframes that hold it still').toBe(HOLDS)

    const widths = await page.evaluate((holds) => {
      for (const sheet of document.styleSheets) {
        for (const rule of sheet.cssRules) {
          if (rule instanceof CSSKeyframesRule && rule.name === holds) {
            return [...rule.cssRules].map((frame) =>
              frame instanceof CSSKeyframeRule ? frame.style.width : '',
            )
          }
        }
      }
      return []
    }, HOLDS)

    expect(widths.length, `no ${HOLDS} keyframes in any stylesheet`).toBeGreaterThan(0)
    expect(new Set(widths), 'the keyframes move the bar').toEqual(new Set(['100%']))
  })
})

/**
 * The sweep with motion on. Without this, a bug that stopped `whatMoves` seeing
 * anything would leave every test above passing on an empty list.
 */
test('with motion on, the desktop does animate', async ({ page }) => {
  await gotoDesktop(page)
  expect((await whatMoves(page)).length).toBeGreaterThan(0)
})
