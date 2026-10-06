import { expect, type Locator, type Page } from '@playwright/test'
import { APPEARANCE_KEY, type Appearance, DEFAULT_APPEARANCE } from '../src/desktop/appearance'
import { HOME, nameAt } from '../src/desktop/file-tree'
import type { Panel } from '../src/desktop/panels'
import { showingsOf } from '../src/desktop/routes'
import { BOOTED_KEY } from '../src/desktop/system-state'

/**
 * What the dock's Finder icon opens. A window is titled by whatever it is on,
 * and Finder is always in a folder, so its window is named after the folder it
 * lands in rather than after the app.
 */
export const FINDER = nameAt(HOME) ?? 'Finder'

/**
 * What the dock's Safari icon opens. A Safari window is always on a project, so
 * a dock icon that names none opens on the first one and the window wears its
 * name.
 */
export const SAFARI = showingsOf('safari')[0].name

/**
 * Lands on the desktop with the boot already out of the way, the same as the
 * second page load of a session. `tests/boot.spec.ts` is where the boot itself
 * is tested; everything else starts here.
 */
export async function gotoDesktop(page: Page, path = '/'): Promise<void> {
  await skipBoot(page)
  await page.goto(path)
}

/** For a test that needs the response, or several addresses in a row. */
export async function skipBoot(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    sessionStorage.setItem(key, 'yes')
  }, BOOTED_KEY)
}

export const dockIcon = (page: Page, name: string) =>
  page.getByTestId('dock').getByRole('button', { name, exact: true })

/** A window by what its title bar says, which is the app until it is on something. */
export const windowNamed = (page: Page, name: string) =>
  page.getByRole('region', { name, exact: true })

export const openWindows = (page: Page) => page.getByTestId('windows').getByRole('region')

/**
 * Waits out the open animation. It scales the window up from 94%, so anything
 * measured while it runs is a few pixels short of where the window ends up.
 */
export const settled = async (pane: Locator) => {
  await pane.evaluate(async (node) => {
    await Promise.all(node.getAnimations().map((animation) => animation.finished))
  })
}

export const openWindow = async (page: Page, name: string, titled = name) => {
  await dockIcon(page, name).click()
  const pane = windowNamed(page, titled)
  await expect(pane).toBeVisible()
  await settled(pane)
  return pane
}

/** One thing in Finder's file grid, by where it is in the tree. */
export const finderItem = (page: Page, path: string) => page.locator(`[data-file="${path}"]`)

/** One of the four folders in Finder's sidebar. */
export const finderPlace = (page: Page, slug: string) => page.locator(`[data-place="${slug}"]`)

/** Opens a file or walks into a folder, the way a reader with a mouse does. */
export const openItem = async (page: Page, path: string) => {
  await finderItem(page, path).dblclick()
}

/**
 * Lands with a theme, a wallpaper, or a brightness already chosen, the way a
 * reader who has been here before does. It writes the storage the layout's
 * script reads before the first paint, so this exercises the real path rather
 * than reaching into the store.
 */
export async function chooseAppearance(page: Page, appearance: Partial<Appearance>): Promise<void> {
  await page.addInitScript(
    ([key, value]) => {
      localStorage.setItem(key, value)
    },
    [APPEARANCE_KEY, JSON.stringify({ ...DEFAULT_APPEARANCE, ...appearance })] as const,
  )
}

/** The menu bar button that opens a panel, or closes the one it opened. */
export const panelOpener = (page: Page, panel: Panel) =>
  page.locator(`[data-panel-opener="${panel}"]`)

/**
 * The colour the wallpaper actually paints with, read off the gradient stop
 * rather than off the custom property behind it. Both say which palette is on,
 * and this one also says the page resolved it.
 */
export const wallpaperColour = (page: Page) =>
  page
    .locator('#wall-base stop')
    .first()
    .evaluate((node) => getComputedStyle(node).stopColor)

/**
 * Tabs from the top of the page until the keyboard is on the dock, and answers
 * with how many presses that took. A number written down here instead would be
 * two numbers: the menu bar comes before the dock in the tab order and part of
 * it is hidden under 640px, so the count is not the same on a phone.
 */
export async function tabToTheDock(page: Page): Promise<number> {
  for (let presses = 1; presses <= 12; presses += 1) {
    await page.keyboard.press('Tab')
    if ((await page.locator(':focus[data-dock-item]').count()) > 0) return presses
  }
  throw new Error('twelve presses of Tab never reached the dock')
}
