import { notFound } from 'next/navigation'
import { addressedApps } from '@/desktop/apps'
import { OpenOnLoad } from '@/desktop/open-on-load'
import { targetAt } from '@/desktop/routes'

/** One static page per app with an address. Anything off the registry is a 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return addressedApps.map((app) => ({ app: app.id }))
}

export default async function AppRoute({ params }: { params: Promise<{ app: string }> }) {
  const target = targetAt(`/${(await params).app}`)
  if (!target) notFound()
  return <OpenOnLoad {...target} />
}
