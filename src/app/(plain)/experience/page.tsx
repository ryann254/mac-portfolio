import type { Metadata } from 'next'
import type { Role } from '@/content'
import { experience } from '@/content'

export const metadata: Metadata = {
  title: 'Experience',
  description: 'Where Ryan Waweru has worked and what he built there.',
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export function readableMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-')
  return `${MONTHS[Number(month) - 1]} ${year}`
}

export function span(role: Role): string {
  return `${readableMonth(role.start)} to ${role.end ? readableMonth(role.end) : 'now'}`
}

export default function ExperiencePage() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-semibold text-3xl tracking-tight">Experience</h1>
      {experience.map((role) => (
        <article key={role.slug} className="flex flex-col gap-3">
          <header className="flex flex-col gap-1">
            <h2 className="font-semibold text-xl tracking-tight">
              {role.title}, {role.company}
            </h2>
            <p className="text-sm text-zinc-500">
              <time dateTime={role.start}>{span(role)}</time>
              {' · '}
              {role.location}
              {' · '}
              {role.arrangement}
            </p>
          </header>
          <ul className="flex list-disc flex-col gap-2 pl-5 text-zinc-700">
            {role.bullets.map((bullet) => (
              <li key={bullet.slice(0, 32)}>{bullet}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
