import { expect, type Page, test } from '@playwright/test'
import { projects } from '../src/content'
import { routes } from '../src/desktop/routes'
import { findTells, quote } from '../src/lib/copy-tells'
import { dockIcon, gotoDesktop, openItem, panelOpener, windowNamed } from './desktop'

/**
 * The copy net over what a reader actually sees. `scripts/copy-check.ts` reads
 * the content modules and the pages the build rendered, and those pages are
 * the shell and nothing else: every app body arrives with `next/dynamic` after
 * hydration, so the words inside a window only exist in a browser. This is
 * where they get read.
 *
 * The patterns are in `src/lib/copy-tells.ts`, which is also what the script
 * uses, so there is one list of tells and two places pointed at it.
 */

/** Everything the reader can read, including what a screen reader says aloud. */
async function readable(page: Page): Promise<string> {
  return page.evaluate(() => {
    const spoken = ['aria-label', 'alt', 'title', 'placeholder'].flatMap((attribute) =>
      [...document.querySelectorAll(`[${attribute}]`)].map((node) => node.getAttribute(attribute)),
    )
    return [document.body.innerText, ...spoken.filter(Boolean)].join('\n')
  })
}

async function readsLikeRyan(page: Page, where: string): Promise<void> {
  const text = await readable(page)

  // A net held up to nothing catches nothing, and every test here would pass
  // on a window that failed to open. The shell alone reads about 400
  // characters; anything less than this means nothing was up yet.
  expect(text.length, `${where} gave the net nothing to read`).toBeGreaterThan(300)

  const hits = findTells(text).map((hit) => `${hit.tell} in "${quote(text, hit.at)}"`)
  expect(hits, `${where} reads as machine made`).toEqual([])
}

/**
 * One test per address rather than a loop, so a sentence that drifts names the
 * address it is on. The phone runs the two tests below instead: every window
 * here is the same component at both widths, and the home screen is not.
 */
test.describe('every address', () => {
  test.skip(({ isMobile }) => Boolean(isMobile), 'the same windows, the same words')

  for (const route of routes) {
    test(`${route} reads like Ryan wrote it`, async ({ page }) => {
      await gotoDesktop(page, route)
      // `/` is the desktop with nothing open on it; every other address lands
      // with its app's window up, and the words inside it are the point.
      const landed =
        route === '/'
          ? page.getByTestId('welcome-tagline')
          : page.getByTestId('windows').getByRole('region').first()
      await expect(landed).toBeVisible()

      await readsLikeRyan(page, route)
    })
  }
})

test('an address nothing answers to reads like Ryan wrote it', async ({ page }) => {
  await gotoDesktop(page, '/not-a-folder')
  await expect(page.getByText('There is nothing at that address')).toBeVisible()

  await readsLikeRyan(page, '/not-a-folder')
})

test('the home screen reads like Ryan wrote it', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'the home screen is under 768px')
  await gotoDesktop(page)
  await expect(page.getByTestId('home-screen')).toBeVisible()

  await readsLikeRyan(page, 'the home screen')
})

test('the panels read like Ryan wrote it', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'phase 9 puts a home screen here instead of the dock')
  await gotoDesktop(page)

  await panelOpener(page, 'apple').click()
  await expect(page.getByTestId('apple-menu')).toBeVisible()
  await readsLikeRyan(page, 'the Apple menu')

  await page.getByRole('button', { name: 'About This Site' }).click()
  await expect(page.getByTestId('about-this-site')).toBeVisible()
  await readsLikeRyan(page, 'About This Site')
  await page.getByTestId('about-this-site').getByRole('button', { name: 'Close' }).click()

  await panelOpener(page, 'control-centre').click()
  await expect(page.getByTestId('control-centre')).toBeVisible()
  await readsLikeRyan(page, 'Control Centre')
  await panelOpener(page, 'control-centre').click()

  await panelOpener(page, 'spotlight').click()
  const spotlight = page.getByRole('combobox', { name: 'Spotlight Search' })
  await spotlight.fill(projects[0].name)
  await expect(page.getByRole('listbox', { name: 'Results' })).toBeVisible()
  await readsLikeRyan(page, 'Spotlight with results')

  await spotlight.fill('qqqq')
  await expect(page.getByText('Nothing here is called that.')).toBeVisible()
  await readsLikeRyan(page, 'Spotlight with nothing to show')
  await page.keyboard.press('Escape')

  await dockIcon(page, 'Launchpad').click()
  await expect(page.getByTestId('launchpad-apps')).toBeVisible()
  await readsLikeRyan(page, 'Launchpad')
})

test('the windows Finder opens on a file read like Ryan wrote them', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'a double click on an emulated phone is a zoom, not an open')
  const [project] = projects
  const folder = `projects/${project.slug}`

  await gotoDesktop(page, '/finder/projects')
  await openItem(page, folder)
  await openItem(page, `${folder}/readme.txt`)
  await expect(windowNamed(page, 'readme.txt')).toBeVisible()
  await readsLikeRyan(page, `${project.name}'s readme`)

  // A second landing rather than a second double click: the window that just
  // opened sits over the folder the picture is in.
  await gotoDesktop(page, '/finder/projects')
  await openItem(page, folder)
  await openItem(page, `${folder}/${project.slug}.png`)
  await expect(windowNamed(page, `${project.slug}.png`)).toBeVisible()
  await readsLikeRyan(page, `${project.name}'s screenshot`)
})

test('the screens the Apple menu raises read like Ryan wrote them', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'phase 9 puts a home screen here instead of the menu bar')
  await gotoDesktop(page)

  await panelOpener(page, 'apple').click()
  await page.getByRole('button', { name: 'Sleep' }).click()
  await expect(page.getByTestId('dark-screen')).toBeVisible()
  await readsLikeRyan(page, 'the sleeping screen')
  await page.getByTestId('dark-screen').click()

  await panelOpener(page, 'apple').click()
  await page.getByRole('button', { name: 'Lock Screen' }).click()
  await expect(page.getByTestId('lock-screen')).toBeVisible()
  await readsLikeRyan(page, 'the lock screen')
})
