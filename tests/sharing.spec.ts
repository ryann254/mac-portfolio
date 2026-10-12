import { expect, test } from '@playwright/test'
import { routes } from '../src/desktop/routes'

/**
 * What a link to this site looks like somewhere else. Every address the
 * registry promises has to carry a picture and has to be in the sitemap, and
 * both lists are generated from `routes.ts`, so what is really being checked is
 * that the generation happened and the files are served.
 */
test.describe.configure({ mode: 'parallel' })

test('the sitemap lists every address the registry promises, and no others', async ({
  request,
}) => {
  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.ok(), 'there is no sitemap').toBe(true)

  const body = await sitemap.text()
  const listed = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((hit) => new URL(hit[1]).pathname)

  expect([...listed].sort()).toEqual([...routes].sort())
})

test('robots points at the sitemap', async ({ request }) => {
  const robots = await request.get('/robots.txt')
  expect(robots.ok(), 'there is no robots.txt').toBe(true)

  const body = await robots.text()
  expect(body).toContain('Sitemap:')
  expect(body).toMatch(/Sitemap:.*\/sitemap\.xml/)
})

/**
 * One test per address rather than a loop, so a card that fails to render names
 * the address it belongs to rather than the first one that happened to break.
 */
for (const route of routes) {
  test(`${route} carries a picture a link preview can use`, async ({ page, request }) => {
    await page.goto(route)

    const declared = await page.locator('meta[property="og:image"]').first().getAttribute('content')
    expect(declared, `${route} declares no og:image`).toBeTruthy()

    // The declared URL is absolute against the production origin, which is not
    // where this suite is running, so only the path is reused.
    const asked = new URL(declared ?? '')
    const image = await request.get(`${asked.pathname}${asked.search}`)

    expect(image.status(), `${route} has an og:image that does not answer`).toBe(200)
    expect(image.headers()['content-type']).toContain('image/')
    expect((await image.body()).byteLength, `${route} has an empty og:image`).toBeGreaterThan(1000)
  })
}
