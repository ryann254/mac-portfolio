import { experience, profile, projects } from '@/content'
import type { Project, Role, SkillGroup } from '@/content/types'
import { type App, appById, openableApps } from './apps'
import { fileOfRole } from './file-tree'
import { employerOf } from './project-view'
import type { Target } from './routes'

/**
 * What Spotlight searches, which is everything the desktop holds: the apps, the
 * five projects, the roles on the CV, and the skill groups. Every row is built
 * from the registry or from `src/content`, so a project added to the CV is
 * findable the same afternoon with no edit here.
 *
 * Launchpad's filter is the bottom of this file, on the same matcher, because
 * two spellings of "name contains what you typed" is one too many.
 */

/** What a row is. It is also the word the list puts beside it. */
export type Kind = 'Application' | 'Project' | 'Work experience' | 'Skills'

/** A row that leaves the site, which is a link rather than a window. */
export type Offsite = { readonly href: string }

export type Hit = {
  readonly key: string
  readonly name: string
  readonly kind: Kind
  /** The line under the name, which says why this row answered the query. */
  readonly detail?: string
  readonly icon: string
  readonly opens: Target | Offsite
}

export const isOffsite = (opens: Target | Offsite): opens is Offsite => 'href' in opens

type Candidate = {
  readonly hit: Hit
  /** The rest of what it is made of, matched after its name and never shown. */
  readonly also: readonly string[]
}

const appRow = (app: App): Candidate => ({
  hit: {
    key: `app-${app.id}`,
    name: app.name,
    kind: 'Application',
    detail: app.reach === 'offsite' ? 'Opens in a new tab' : undefined,
    icon: app.icon,
    opens: app.href === undefined ? { app: app.id } : { href: app.href },
  },
  also: [],
})

const projectRow = (project: Project): Candidate => ({
  hit: {
    key: `project-${project.slug}`,
    name: project.name,
    kind: 'Project',
    /* The stack, because a reader who typed a stack tag wants to see it in the
       row that came back rather than wonder which word matched. */
    detail: project.stack.join(', '),
    icon: appById('safari').icon,
    opens: { app: 'safari', showing: project.slug },
  },
  also: [...project.stack, project.tagline, employerOf(project)],
})

const roleRow = (role: Role): Candidate => ({
  hit: {
    key: `role-${role.slug}`,
    name: role.title,
    kind: 'Work experience',
    detail: role.company,
    icon: appById('text').icon,
    opens: { app: 'text', showing: fileOfRole(role) },
  },
  also: [role.company, role.location],
})

const skillRow = (group: SkillGroup): Candidate => ({
  hit: {
    key: `skills-${group.name}`,
    name: group.name,
    kind: 'Skills',
    detail: group.skills.join(', '),
    icon: appById('terminal').icon,
    opens: { app: 'terminal' },
  },
  also: group.skills,
})

/** In the order a tie is broken: the registry first, then the CV's own order. */
const candidates: readonly Candidate[] = [
  ...openableApps.map(appRow),
  ...projects.map(projectRow),
  ...experience.map(roleRow),
  ...profile.skillGroups.map(skillRow),
]

/**
 * How well a row answers the query, lowest first: its name exactly, its name
 * from the start, its name anywhere, then anything else it is made of. An
 * undefined rank is a row that does not answer at all.
 */
const rankOf = (want: string, candidate: Candidate): number | undefined => {
  const name = candidate.hit.name.toLowerCase()
  if (name === want) return 0
  if (name.startsWith(want)) return 1
  if (name.includes(want)) return 2
  return candidate.also.some((text) => text.toLowerCase().includes(want)) ? 3 : undefined
}

/**
 * Everything that answers the query, best first. An empty query answers with
 * nothing rather than with everything, because Spotlight with no query is a
 * box waiting to be typed in and not a list of the whole site.
 */
export function search(query: string): readonly Hit[] {
  const want = query.trim().toLowerCase()
  if (want === '') return []
  return candidates
    .flatMap((candidate) => {
      const rank = rankOf(want, candidate)
      return rank === undefined ? [] : [{ candidate, rank }]
    })
    .sort((one, other) => one.rank - other.rank)
    .map(({ candidate }) => candidate.hit)
}

/**
 * Launchpad's grid: every app a reader can open, cut down to the ones whose
 * name holds what they typed. It keeps the registry's order rather than ranking,
 * because the grid is a place a reader learns where things are.
 */
export function appsMatching(query: string): readonly App[] {
  const want = query.trim().toLowerCase()
  if (want === '') return openableApps
  return openableApps.filter((app) => app.name.toLowerCase().includes(want))
}
