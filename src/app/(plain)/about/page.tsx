import type { Metadata } from 'next'
import { profile } from '@/content'

export const metadata: Metadata = {
  title: `About ${profile.name}`,
  description: profile.summary[0],
}

export default function AboutPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-semibold text-3xl tracking-tight">{profile.name}</h1>
        <p className="text-lg text-zinc-600">{profile.headline}</p>
        <p className="text-sm text-zinc-500">{profile.location}</p>
      </header>

      <div className="flex flex-col gap-4 text-zinc-700 leading-relaxed">
        {profile.summary.map((paragraph) => (
          <p key={paragraph.slice(0, 32)}>{paragraph}</p>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold text-xl tracking-tight">What came of it</h2>
        <dl className="flex flex-col gap-4">
          {profile.achievements.map((achievement) => (
            <div key={achievement.title}>
              <dt className="font-medium">{achievement.title}</dt>
              <dd className="text-zinc-600">{achievement.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-semibold text-xl tracking-tight">Education and certifications</h2>
        <ul className="flex flex-col gap-1 text-zinc-700" role="list">
          {profile.education.map((item) => (
            <li key={item.award}>
              {item.award}, {item.school}
            </li>
          ))}
          {profile.certifications.map((certification) => (
            <li key={certification}>{certification}</li>
          ))}
        </ul>
      </section>
    </article>
  )
}
