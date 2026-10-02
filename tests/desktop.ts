import { expect, type Locator, type Page } from '@playwright/test'
import { BOOTED_KEY } from '../src/desktop/boot-state'
import { HOME, nameAt } from '../src/desktop/file-tree'
import { showingsOf } from '../src/desktop/routes'

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
