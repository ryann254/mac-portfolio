import { notFound } from 'next/navigation'
import { OpenOnLoad } from '@/desktop/open-on-load'
import { showingsOf, targetAt } from '@/desktop/routes'

/** Finder at one of the four places in its sidebar. */
export const dynamicParams = false

export function generateStaticParams() {
  return showingsOf('finder').map((location) => ({ location: location.slug }))
}

export default async function FinderRoute({ params }: { params: Promise<{ location: string }> }) {
  const target = targetAt(`/finder/${(await params).location}`)
  if (!target) notFound()
  return <OpenOnLoad {...target} />
}
