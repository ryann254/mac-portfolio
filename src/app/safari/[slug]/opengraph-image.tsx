import { notFound } from 'next/navigation'
import { showingsOf, targetAt } from '@/desktop/routes'
import { pageAt } from '@/desktop/safari-tabs'
import { CARD, cardFor, contentType } from '@/lib/og/card'

export const size = CARD
export { contentType }

export function generateStaticParams() {
  return showingsOf('safari').map((project) => ({ slug: project.slug }))
}

/** One card per project, carrying the project's own line rather than Safari's. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  if (!targetAt(`/safari/${slug}`)) notFound()
  const project = pageAt(slug)
  return cardFor(project.name, project.tagline)
}
