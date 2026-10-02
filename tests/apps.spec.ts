import { expect, test } from '@playwright/test'
import { profile, projects } from '../src/content'
import { rows } from '../src/desktop/contact-rows'
import { RESUME_FILE } from '../src/desktop/resume-file'
import { dockIcon, gotoDesktop, openWindow, SAFARI, windowNamed } from './desktop'

test.skip(
  ({ isMobile }) => Boolean(isMobile),
  'under 768px phase 9 puts an iOS home screen here instead of a window manager',
)

test('Safari has a tab per project and opens on the first one', async ({ page }) => {
  await gotoDesktop(page)
  const safari = await openWindow(page, 'Safari', SAFARI)

  await expect(safari.locator('[data-tab]')).toHaveCount(projects.length)
  await expect(safari.locator('[data-tab]')).toHaveText(projects.map((project) => project.name))
  await expect(safari.locator('[data-tab][aria-current]')).toHaveText(projects[0].name)
  await expect(page).toHaveURL(new RegExp(`/safari/${projects[0].slug}$`))
})

test('a tab takes the window, the title, and the address with it', async ({ page }) => {
  await gotoDesktop(page)
  await openWindow(page, 'Safari', SAFARI)
  const third = projects[2]

  await page.locator(`[data-tab="${third.slug}"]`).click()

  // The window is named after what it is on, so switching tabs renames it.
  const on = windowNamed(page, third.name)
  await expect(on).toBeVisible()
  await expect(on.getByRole('heading', { level: 2 })).toHaveText(third.name)
  await expect(page).toHaveURL(new RegExp(`/safari/${third.slug}$`))
})

/**
 * The window shows our own screenshot rather than the site in a frame, because
 * three of the five refuse to be framed. So the one way to the real thing is
 * this link, and a link that opens a tab has to hand the tab no way back.
 */
test('the button to the real site opens a tab that cannot reach this one', async ({ page }) => {
  await gotoDesktop(page, `/safari/${projects[0].slug}`)
  const leaving = windowNamed(page, projects[0].name).getByRole('link', {
    name: new RegExp(`Open ${projects[0].url.replace(/^https:\/\/|\/$/g, '')}`),
  })

  await expect(leaving).toHaveAttribute('href', projects[0].url)
  await expect(leaving).toHaveAttribute('target', '_blank')
  await expect(leaving).toHaveAttribute('rel', /noopener/)
})

test('Terminal prints every skill group the CV has', async ({ page }) => {
  await gotoDesktop(page)
  const terminal = await openWindow(page, 'Terminal')

  await expect(terminal.locator('dt')).toHaveText([
    'Role',
    'Based',
    'Years',
    'Now',
    'Email',
    ...profile.skillGroups.map((group) => group.name),
  ])
  for (const group of profile.skillGroups) {
    await expect(terminal.getByText(group.skills.join(', '), { exact: true })).toBeVisible()
  }
})

test('Photos shows every screenshot and enlarges the one that is clicked', async ({ page }) => {
  await gotoDesktop(page)
  const photos = await openWindow(page, 'Photos')
  const grid = photos.locator('[data-shot]')

  await expect(grid).toHaveCount(projects.length)

  await photos.locator(`[data-shot="${projects[1].slug}"]`).click()

  await expect(grid).toHaveCount(0)
  await expect(photos.getByRole('img')).toHaveAttribute('alt', `The ${projects[1].name} homepage`)
  await expect(photos.getByText(projects[1].name, { exact: false })).toBeVisible()

  // The whole enlarged view is the way back, and it says so at the top of it.
  const back = photos.getByRole('button', { name: /All photos/ })
  await expect(back).toBeVisible()
  await back.click()
  await expect(grid).toHaveCount(projects.length)
})

test('Resume hands the PDF to the browser and the button hands over the file', async ({ page }) => {
  await gotoDesktop(page)
  const resume = await openWindow(page, 'Resume')

  const viewer = resume.locator('object')
  await expect(viewer).toHaveAttribute('type', 'application/pdf')
  await expect(viewer).toHaveAttribute('data', new RegExp(`^${RESUME_FILE}#`))

  const download = resume.getByRole('link', { name: 'Download' })
  await expect(download).toHaveAttribute('href', RESUME_FILE)
  await expect(download).toHaveAttribute('download', 'ryan-waweru.pdf')

  const answer = await page.request.get(RESUME_FILE)
  expect(answer.status()).toBe(200)
  expect(answer.headers()['content-type']).toContain('application/pdf')
})

test('Contact links every row where the content says', async ({ page }) => {
  await gotoDesktop(page)
  const contact = await openWindow(page, 'Contact')

  await expect(contact.getByRole('listitem')).toHaveCount(rows.length)
  for (const row of rows) {
    const link = contact.getByRole('link', { name: new RegExp(row.label) })
    await expect(link, row.label).toHaveAttribute('href', row.href)
    if (row.kind === 'offsite') await expect(link, row.label).toHaveAttribute('rel', /noopener/)
  }
  await expect(contact.getByText(profile.email)).toBeVisible()
})

test('the menu bar names whichever window is in front', async ({ page }) => {
  await gotoDesktop(page)
  const name = page.getByTestId('menu-bar-app')

  await expect(name).toHaveText('Finder')

  await openWindow(page, 'Terminal')
  await expect(name).toHaveText('Terminal')

  await openWindow(page, 'Photos')
  await expect(name).toHaveText('Photos')

  await windowNamed(page, 'Photos').getByRole('button', { name: 'Close Photos' }).click()
  await expect(name).toHaveText('Terminal')
})

test('a keyboard alone reaches Safari and the project behind a tab', async ({ page }) => {
  await gotoDesktop(page)
  await dockIcon(page, 'Safari').focus()
  await page.keyboard.press('Enter')
  await expect(windowNamed(page, SAFARI)).toBeVisible()

  // Into the window, past the three lights, then along the tabs to the second.
  for (let press = 0; press < 5; press += 1) await page.keyboard.press('Tab')
  await expect(page.locator(`[data-tab="${projects[1].slug}"]`)).toBeFocused()

  await page.keyboard.press('Enter')

  await expect(page).toHaveURL(new RegExp(`/safari/${projects[1].slug}$`))
  await expect(windowNamed(page, projects[1].name)).toBeVisible()
})
