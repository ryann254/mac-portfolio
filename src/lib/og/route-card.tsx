import { notFound } from 'next/navigation'
import { targetAt, windowTitle } from '@/desktop/routes'
import { cardFor } from './card'

/**
 * The card for one address, titled the way the window at that address is
 * titled, so a preview and the window a reader lands in say the same thing.
 */
export async function cardForRoute(route: string, detail?: string) {
  const target = targetAt(route)
  if (!target) notFound()
  return cardFor(windowTitle(target), detail)
}
