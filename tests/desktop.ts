import type { Page } from '@playwright/test'
import { BOOTED_KEY } from '../src/desktop/boot-state'

/**
 * Lands on the desktop with the boot already out of the way, the same as the
 * second page load of a session. `tests/boot.spec.ts` is where the boot itself
 * is tested; everything else starts here.
 */
export async function gotoDesktop(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    sessionStorage.setItem(key, 'yes')
  }, BOOTED_KEY)
  await page.goto('/')
}
