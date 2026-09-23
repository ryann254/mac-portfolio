import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { projects } from '@/content'

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Five things Ryan Waweru has worked on.',
}

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-semibold text-3xl tracking-tight">Projects</h1>
      <ul className="flex flex-col gap-10" role="list">
        {projects.map((project) => (
          <li key={project.slug} className="flex flex-col gap-3">
            <Link href={`/projects/${project.slug}`} className="group flex flex-col gap-3">
              <Image
                src={project.thumbnail}
                alt={`The ${project.name} site`}
                width={1440}
                height={900}
                className="rounded-lg ring-1 ring-zinc-200"
                sizes="(min-width: 768px) 42rem, 100vw"
              />
              <h2 className="font-semibold text-xl tracking-tight group-hover:underline">
                {project.name}
              </h2>
            </Link>
            <p className="text-zinc-700">{project.tagline}</p>
            <p className="text-sm text-zinc-500">
              {project.period} · {project.stack.join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
