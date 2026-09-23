import type { Metadata } from 'next'
import { profile } from '@/content'

export const metadata: Metadata = {
  title: 'Skills',
  description: 'What Ryan Waweru works with.',
}

export default function SkillsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-semibold text-3xl tracking-tight">Skills</h1>
      {profile.skillGroups.map((group) => (
        <section key={group.name} className="flex flex-col gap-3">
          <h2 className="font-semibold text-xl tracking-tight">{group.name}</h2>
          <ul className="flex flex-wrap gap-2" role="list">
            {group.skills.map((skill) => (
              <li key={skill} className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
