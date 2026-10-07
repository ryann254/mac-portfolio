import { expect, test } from '@playwright/test'
import { experience, profile, projects } from '../src/content'
import { contentsOf } from '../src/desktop/file-tree'
import { initialsOf } from '../src/desktop/lettermark'
import { contrastRatio, type Rgb, requiredRatio } from '../src/lib/contrast'
import {
  dockIcon,
  FINDER,
  finderItem,
  finderPlace,
  gotoDesktop,
  openItem,
  openWindows,
  windowNamed,
} from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of a window manager',
)

const INSIDE = `projects/${projects[0].slug}`

test('the sidebar walks to each folder and the window is titled by it', async ({ page }) => {
  await gotoDesktop(page, '/finder')
  await expect(windowNamed(page, 'Intro')).toBeVisible()

  for (const [slug, name] of [
    ['projects', 'Projects'],
    ['experience', 'Work Experience'],
    ['skills', 'Skills'],
    ['about', 'Intro'],
  ]) {
    await finderPlace(page, slug).click()
    await expect(windowNamed(page, name)).toBeVisible()
    await expect(finderPlace(page, slug)).toHaveAttribute('aria-current', 'page')
  }
})

test('every project is a folder and every role a file, out of the content', async ({ page }) => {
  await gotoDesktop(page, '/finder/projects')
  for (const project of projects) {
    await expect(finderItem(page, `projects/${project.slug}`)).toHaveText(project.name)
  }

  await finderPlace(page, 'experience').click()
  for (const role of experience) {
    await expect(finderItem(page, `experience/${role.slug}.txt`)).toBeVisible()
  }
  await expect(page.locator('[data-file]')).toHaveCount(experience.length)
})

test('double-clicking about.txt opens the summary in a text window', async ({ page }) => {
  await gotoDesktop(page, '/finder/about')
  await openItem(page, 'about/about.txt')

  const text = windowNamed(page, 'about.txt')
  await expect(text).toBeVisible()
  await expect(text).toContainText(profile.summary[0])
  await expect(openWindows(page)).toHaveCount(2)
})

test('a role file reads as a document, with its figures set apart', async ({ page }) => {
  const role = experience[0]
  await gotoDesktop(page, '/finder/experience')
  await openItem(page, `experience/${role.slug}.txt`)

  const text = windowNamed(page, `${role.slug}.txt`)
  // The title, the company and the dates each have their own place now, rather
  // than being three lines joined by newlines inside the first paragraph.
  await expect(text.getByRole('heading', { level: 2 })).toHaveText(role.title)
  await expect(text).toContainText(role.company)
  await expect(text.getByRole('listitem')).toHaveCount(role.bullets.length)

  // 29% is a figure. The year beside it is a date, and stays prose.
  await expect(text.locator('b').first()).toHaveText(/\d+%/)
  await expect(text.locator('b', { hasText: /^\d{4}$/ })).toHaveCount(0)
})

/**
 * Four of the eight companies have no site left to take a logo from, so both
 * kinds of mark are checked here: a fetched logo, and the initials that stand
 * in for one. The initials carry their own colour, and white letters on a hue
 * off a hash is exactly the kind of thing that works for seven names and fails
 * for the eighth, so the ratio is measured rather than assumed.
 */
test('a role wears its company logo, or initials that can be read', async ({ page }) => {
  const [withLogo] = experience.filter((role) => role.logo !== undefined)
  const lettered = experience.filter((role) => role.logo === undefined)

  await gotoDesktop(page, '/finder/experience')
  await openItem(page, `experience/${withLogo.slug}.txt`)
  const marked = windowNamed(page, `${withLogo.slug}.txt`)
  await expect(marked.locator('[data-logo] img')).toHaveAttribute('src', withLogo.logo ?? '')

  for (const role of lettered) {
    // Back to the desktop each time, because the file just opened is over Finder.
    await gotoDesktop(page, '/finder/experience')
    await openItem(page, `experience/${role.slug}.txt`)
    const shown = windowNamed(page, `${role.slug}.txt`)
    const letters = shown.locator('[data-logo]')

    await expect(letters).toHaveText(initialsOf(role.company))
    await expect(shown).toContainText(role.company)

    const [tile, ink] = await letters.evaluate(painted)
    expect(
      contrastRatio(ink, tile),
      `${role.company} initials on their own tile`,
    ).toBeGreaterThanOrEqual(requiredRatio(false))
  }
})

/**
 * The tile's colour and the letters', both resolved by a canvas. These are
 * written as `oklch()` and reading the strings back would mean parsing a colour
 * space; painting them is the browser's own answer for what lands on screen.
 */
const painted = (node: Element): [Rgb, Rgb] => {
  const canvas = document.createElement('canvas')
  const ink = canvas.getContext('2d')
  if (!ink) throw new Error('this browser has no 2d canvas to mix the colour in')
  const read = (colour: string): Rgb => {
    ink.fillStyle = colour
    ink.fillRect(0, 0, 1, 1)
    const [red, green, blue] = ink.getImageData(0, 0, 1, 1).data
    return [red, green, blue]
  }
  const style = getComputedStyle(node)
  return [read(style.backgroundColor), read(style.color)]
}

test('a project readme carries its link and its stack', async ({ page }) => {
  const project = projects[0]
  await gotoDesktop(page, '/finder/projects')
  await openItem(page, `projects/${project.slug}`)
  await openItem(page, `projects/${project.slug}/readme.txt`)

  const text = windowNamed(page, 'readme.txt')
  await expect(text.getByRole('link', { name: new RegExp(project.slug, 'i') })).toHaveAttribute(
    'href',
    project.url,
  )
  for (const tool of project.stack) await expect(text).toContainText(tool)
})

test('double-clicking a thumbnail opens that picture in an image window', async ({ page }) => {
  await gotoDesktop(page, '/finder/projects')
  await openItem(page, INSIDE)
  await openItem(page, `${INSIDE}/${projects[0].slug}.png`)

  const image = windowNamed(page, `${projects[0].slug}.png`)
  await expect(image).toBeVisible()
  await expect(image.getByRole('img')).toHaveAttribute('alt', `The ${projects[0].name} homepage`)
})

test('a file window has an address of nobody and leaves Finder its own', async ({ page }) => {
  await gotoDesktop(page, '/finder/about')
  await openItem(page, 'about/about.txt')

  await expect(windowNamed(page, 'about.txt')).toBeVisible()
  expect(new URL(page.url()).pathname).toBe('/finder/about')
})

test('walking into a folder puts the trail up, and up walks back out', async ({ page }) => {
  await gotoDesktop(page, '/finder/projects')
  await openItem(page, INSIDE)

  const finder = windowNamed(page, projects[0].name)
  await expect(finder).toBeVisible()
  await expect(finderItem(page, `${INSIDE}/readme.txt`)).toBeVisible()

  const trail = finder.getByRole('navigation', { name: 'Where you are' })
  await expect(trail).toContainText('Projects')
  await trail.getByRole('button', { name: 'Projects', exact: true }).click()
  await expect(windowNamed(page, 'Projects')).toBeVisible()
})

test('back and forward walk the folders, and switch off at the ends', async ({ page }) => {
  await gotoDesktop(page, '/finder')
  const back = () => page.getByRole('button', { name: 'Back', exact: true })
  const forward = () => page.getByRole('button', { name: 'Forward', exact: true })

  await expect(back()).toBeDisabled()
  await expect(forward()).toBeDisabled()

  await finderPlace(page, 'skills').click()
  await expect(windowNamed(page, 'Skills')).toBeVisible()
  await expect(forward()).toBeDisabled()

  await back().click()
  await expect(windowNamed(page, 'Intro')).toBeVisible()
  await expect(back()).toBeDisabled()

  await forward().click()
  await expect(windowNamed(page, 'Skills')).toBeVisible()
  await expect(forward()).toBeDisabled()
})

test('searching cuts the folder down and marks what matched', async ({ page }) => {
  await gotoDesktop(page, '/finder/experience')
  const box = page.getByRole('searchbox', { name: 'Search this folder' })

  await box.fill(experience[0].slug.slice(0, 4))
  await expect(page.locator('[data-file]')).toHaveCount(1)
  await expect(page.locator('mark')).toHaveText(experience[0].slug.slice(0, 4))

  await box.fill('nothing here is called this')
  await expect(page.locator('[data-file]')).toHaveCount(0)
  await expect(windowNamed(page, 'Work Experience')).toContainText('Nothing in this folder')

  /* A search is of one folder, so walking out of it is the end of the search. */
  await finderPlace(page, 'skills').click()
  await expect(box).toHaveValue('')
  await expect(page.locator('[data-file]')).toHaveCount(contentsOf('skills').length)

  /* And of one window, so closing Finder is the end of it too. */
  await box.fill('nothing here either')
  await windowNamed(page, 'Skills').getByRole('button', { name: 'Close Skills' }).click()
  await dockIcon(page, 'Finder').click()
  await expect(page.getByRole('searchbox', { name: 'Search this folder' })).toHaveValue('')
})

test('the address nothing answers to opens a Finder window that names it', async ({ page }) => {
  const landed = await page.goto('/finder/hobbies')
  expect(landed?.status()).toBe(404)

  const missing = windowNamed(page, 'File not found')
  await expect(missing).toBeVisible()
  await expect(missing).toContainText('/finder/hobbies')
  expect(new URL(page.url()).pathname).toBe('/finder/hobbies')

  await missing.getByRole('link', { name: 'Back to the desktop' }).click()
  await expect(openWindows(page)).toHaveCount(0)
  expect(new URL(page.url()).pathname).toBe('/')
})

/**
 * The 404 is a Finder window on a folder that is not there. If that folder went
 * into the trail, the dock would hand the reader the same miss again, in a
 * window with no sidebar to get out of it.
 */
test('the dock never reopens Finder on the address that missed', async ({ page }) => {
  await gotoDesktop(page, '/finder/hobbies')

  const missing = windowNamed(page, 'File not found')
  await expect(missing).toBeVisible()
  await missing.getByRole('link', { name: 'Back to the desktop' }).click()
  await expect(openWindows(page)).toHaveCount(0)

  await dockIcon(page, 'Finder').click()
  await expect(windowNamed(page, FINDER)).toBeVisible()
  await expect(windowNamed(page, 'File not found')).toHaveCount(0)
})

test('Finder opens again in the folder it was left in', async ({ page }) => {
  await gotoDesktop(page, '/finder')
  await finderPlace(page, 'skills').click()
  await expect(windowNamed(page, 'Skills')).toBeVisible()

  await windowNamed(page, 'Skills').getByRole('button', { name: 'Close Skills' }).click()
  await expect(openWindows(page)).toHaveCount(0)

  /* The dock names no folder, so the window it reopens is titled by the one the
     trail was left in rather than by the app. */
  await dockIcon(page, 'Finder').click()
  await expect(windowNamed(page, 'Skills')).toBeVisible()
})

test('a keyboard alone reaches the dock, Finder, and a file inside it', async ({ page }) => {
  await gotoDesktop(page)
  await dockIcon(page, 'Finder').focus()
  await page.keyboard.press('Enter')
  await expect(windowNamed(page, 'Intro')).toBeVisible()

  await finderItem(page, 'about/about.txt').focus()
  await page.keyboard.press('Enter')
  await expect(windowNamed(page, 'about.txt')).toBeVisible()
  await expect(windowNamed(page, 'about.txt')).toBeFocused()
})
