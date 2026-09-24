import { expect, test } from '@playwright/test'
import { gotoDesktop } from './desktop'

const AT = new Date('2026-09-24T18:41:00')

test('the menu bar reads the wall clock', async ({ page }) => {
  await page.clock.install({ time: AT })
  await gotoDesktop(page)

  await expect(page.getByTestId('menu-clock')).toHaveText('Thu 24 Sep 6:41 PM')
})

test('both clocks show the same minute', async ({ page }) => {
  await page.clock.install({ time: AT })
  await gotoDesktop(page)

  const desk = page.getByTestId('desk-clock')
  await expect(desk).toContainText('THU · SEP 24')
  expect((await desk.textContent())?.replace(/\D/g, '')).toContain('0641')
  await expect(page.getByTestId('menu-clock')).toContainText('6:41')
})

test('the menu bar keeps up with the minute turning over', async ({ page }) => {
  await page.clock.install({ time: AT })
  await gotoDesktop(page)
  await expect(page.getByTestId('menu-clock')).toHaveText('Thu 24 Sep 6:41 PM')

  await page.clock.fastForward('01:00')

  await expect(page.getByTestId('menu-clock')).toHaveText('Thu 24 Sep 6:42 PM')
})

test('the desktop folders lead to the content', async ({ page }) => {
  await gotoDesktop(page)

  const folders = page.getByRole('navigation', { name: 'Desktop' }).getByRole('link')
  await expect(folders).toHaveText(['Intro', 'Projects', 'Work Experience', 'Contacts'])

  await folders.filter({ hasText: 'Work Experience' }).click()
  await expect(page).toHaveURL(/\/experience$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Experience')
})

test('the desktop names who it belongs to', async ({ page }) => {
  await gotoDesktop(page)

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ryan Waweru')
  await expect(page.getByTestId('welcome-role')).toHaveText('Senior Frontend Engineer')
  await expect(page.getByTestId('welcome-tagline')).toContainText('6+ years of React')
})
