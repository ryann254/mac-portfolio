import type { Metadata } from 'next'
import { profile } from '@/content'

export const metadata: Metadata = {
  title: 'Contact',
  description: `How to reach ${profile.name}.`,
}

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-semibold text-3xl tracking-tight">Contact</h1>
      <p className="text-zinc-700">{profile.location}. The quickest way to reach me is email.</p>
      <ul className="flex flex-col gap-2" role="list">
        <li>
          <a className="text-blue-700 underline" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </li>
        {profile.links.map((link) => (
          <li key={link.href}>
            <a
              className="text-blue-700 underline"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
