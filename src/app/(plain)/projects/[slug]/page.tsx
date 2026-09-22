import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { projects } from '@/content'

type Params = { params: Promise<{ slug: string }> }

const find = (slug: string) => projects.find((project) => project.slug === slug)

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const project = find((await params).slug)
  if (!project) return {}
  return { title: project.name, description: project.tagline }
}

export default async function ProjectPage({ params }: Params) {
  const project = find((await params).slug)
  if (!project) notFound()

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-3xl tracking-tight">{project.name}</h1>
        <p className="text-lg text-zinc-600">{project.tagline}</p>
      </header>

      <Image
        src={project.thumbnail}
        alt={`The ${project.name} site`}
        width={1440}
        height={900}
        className="rounded-lg ring-1 ring-zinc-200"
        sizes="(min-width: 768px) 42rem, 100vw"
        priority
      />
      <p className="text-sm text-zinc-500">{project.thumbnailNote}</p>

      <section className="flex flex-col gap-4 text-zinc-700 leading-relaxed">
        <h2 className="font-semibold text-xl tracking-tight text-zinc-900">What I did</h2>
        {project.contribution.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </section>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="text-zinc-500">When</dt>
          <dd>{project.period}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-zinc-500">Built with</dt>
          <dd>{project.stack.join(', ')}</dd>
        </div>
      </dl>

      <a
        className="text-blue-700 underline"
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit {project.name}
      </a>
    </article>
  )
}
