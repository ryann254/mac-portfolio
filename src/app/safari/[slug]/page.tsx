import { notFound } from 'next/navigation'
import { OpenOnLoad } from '@/desktop/open-on-load'
import { showingsOf, targetAt } from '@/desktop/routes'

/** Safari on one project. */
export const dynamicParams = false

export function generateStaticParams() {
  return showingsOf('safari').map((project) => ({ slug: project.slug }))
}

export default async function SafariRoute({ params }: { params: Promise<{ slug: string }> }) {
  const target = targetAt(`/safari/${(await params).slug}`)
  if (!target) notFound()
  return <OpenOnLoad {...target} />
}
