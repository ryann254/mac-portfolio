import { expect, test } from '@playwright/test'
import { experience, profile, projects } from '../src/content'

/**
 * Phase 1 has no desktop yet, so these routes are how the content is read. Each
 * check asserts the heading and one string that could only come from the real
 * content, which is what catches a route wired to the wrong module.
 */
const pages = [
  { path: '/about', heading: profile.name, known: '29%' },
  { path: '/experience', heading: 'Experience', known: experience[0].company },
  { path: '/projects', heading: 'Projects', known: projects[0].tagline },
  { path: '/skills', heading: 'Skills', known: profile.skillGroups[0].skills[0] },
  { path: '/contact', heading: 'Contact', known: profile.email },
]

for (const page of pages) {
  test(`${page.path} renders its content`, async ({ page: browserPage }) => {
    await browserPage.goto(page.path)

    await expect(browserPage.getByRole('heading', { level: 1 })).toHaveText(page.heading)
    await expect(browserPage.getByText(page.known, { exact: false }).first()).toBeVisible()
  })
}

test('every project has its own page, reachable from the list', async ({ page }) => {
  await page.goto('/projects')

  for (const project of projects) {
    await expect(page.getByRole('link', { name: project.name })).toBeVisible()
  }
})

for (const project of projects) {
  test(`the ${project.name} page shows the work and links out`, async ({ page }) => {
    await page.goto(`/projects/${project.slug}`)

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.name)
    await expect(page.getByRole('img', { name: `The ${project.name} site` })).toBeVisible()

    const link = page.getByRole('link', { name: `Visit ${project.name}` })
    await expect(link).toHaveAttribute('href', project.url)
    await expect(link).toHaveAttribute('rel', /noopener/)
  })
}

test('the thumbnails are actually served, not broken links', async ({ page }) => {
  const failed: string[] = []
  page.on('response', (response) => {
    if (response.url().includes('/_next/image') && !response.ok()) failed.push(response.url())
  })

  await page.goto('/projects')
  await page.waitForLoadState('networkidle')

  expect(failed).toEqual([])
})
