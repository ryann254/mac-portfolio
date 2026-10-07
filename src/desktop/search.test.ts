import { describe, expect, it } from 'vitest'
import { experience, profile, projects } from '@/content'
import { appById, offsiteApps, openableApps } from './apps'
import { fileAt } from './file-tree'
import { appsMatching, type Hit, isOffsite, search } from './search'

const kinds = (query: string) => search(query).map((hit) => hit.kind)
const names = (query: string) => search(query).map((hit) => hit.name)
const first = (query: string): Hit => {
  const [top] = search(query)
  if (!top) throw new Error(`nothing answered "${query}"`)
  return top
}

describe('search', () => {
  it('answers an empty query with nothing, because the box is waiting', () => {
    expect(search('')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('answers a query nothing holds with nothing', () => {
    expect(search('fortran')).toEqual([])
  })

  it('puts an app with that exact name first', () => {
    for (const app of openableApps) {
      expect(first(app.name).name, app.name).toBe(app.name)
      expect(first(app.name).kind).toBe('Application')
    }
  })

  it('does not care about case', () => {
    expect(first('sAFARi').name).toBe('Safari')
  })

  it('finds a project by its name and opens Safari on it', () => {
    const project = projects[2]
    const hit = first(project.name)
    expect(hit.kind).toBe('Project')
    expect(hit.opens).toEqual({ app: 'safari', showing: project.slug })
  })

  it('finds a project by a stack tag, and says which stack it found', () => {
    const flutter = projects.filter((project) => project.stack.includes('Flutter'))
    expect(flutter.length).toBeGreaterThan(0)
    for (const project of flutter) {
      const hit = search('Flutter').find((found) => found.name === project.name)
      expect(hit?.kind, project.name).toBe('Project')
      expect(hit?.detail).toContain('Flutter')
    }
  })

  it('finds a role by the company it was at, and opens the file Finder has', () => {
    for (const role of experience) {
      const hit = search(role.company).find((found) => found.kind === 'Work experience')
      expect(hit?.detail, role.company).toBe(role.company)
      expect(hit?.name).toBe(role.title)
    }
  })

  it('finds a skill group by one of the skills inside it', () => {
    const [group] = profile.skillGroups.filter((one) => one.skills.includes('GraphQL'))
    const hit = search('GraphQL').find((found) => found.kind === 'Skills')
    expect(hit?.name).toBe(group.name)
    expect(hit?.opens).toEqual({ app: 'terminal' })
  })

  it('ranks a name over a mention of the same word somewhere else', () => {
    // Streamlyne is a project, the company a role was at, and a stack line.
    expect(kinds('Streamlyne')[0]).toBe('Project')
    expect(kinds('Streamlyne')).toContain('Work experience')
  })

  it('ranks a name that starts with the query over one that merely holds it', () => {
    const got = names('s')
    expect(got.indexOf('Safari')).toBeLessThan(got.indexOf('Photos'))
  })

  it('ranks an exact name over a longer one that holds it', () => {
    // "Mobile" is a skill group, and two of the roles are a Mobile Engineer.
    expect(first('Mobile').kind).toBe('Skills')
    expect(kinds('Mobile')).toContain('Work experience')
  })

  it('opens something that is really there, on every row', () => {
    const everything = [
      ...openableApps.map((app) => app.name),
      ...projects.map((project) => project.name),
      ...experience.map((role) => role.company),
      ...profile.skillGroups.map((group) => group.name),
    ]
    for (const { opens } of everything.flatMap((query) => search(query))) {
      if (isOffsite(opens)) {
        expect(offsiteApps.map((app) => app.href)).toContain(opens.href)
        continue
      }
      expect(() => appById(opens.app)).not.toThrow()
      if (opens.app === 'text') expect(fileAt(opens.showing ?? '')).toBeDefined()
    }
  })

  it('sends the two offsite apps to a tab rather than to a window', () => {
    for (const app of offsiteApps) {
      expect(first(app.name).opens).toEqual({ href: app.href })
      expect(first(app.name).detail).toBe('Opens in a new tab')
    }
  })
})

describe('appsMatching, which is what Launchpad draws', () => {
  it('shows every app a reader can open when nothing is typed', () => {
    expect(appsMatching('')).toEqual(openableApps)
    expect(appsMatching('  ')).toEqual(openableApps)
  })

  it('leaves out Launchpad itself, which is the grid rather than a thing in it', () => {
    expect(appsMatching('launch')).toEqual([])
    expect(appsMatching('').map((app) => app.id)).not.toContain('launchpad')
  })

  it('leaves out the windows that need a file Finder picked', () => {
    expect(appsMatching('').map((app) => app.id)).not.toContain('text')
    expect(appsMatching('').map((app) => app.id)).not.toContain('image')
  })

  it('cuts the grid down to the names holding what was typed', () => {
    expect(appsMatching('saf').map((app) => app.id)).toEqual(['safari'])
    expect(appsMatching('LINKED').map((app) => app.id)).toEqual(['linkedin'])
  })

  it('keeps the registry order rather than ranking, so the grid holds still', () => {
    const shown = appsMatching('e').map((app) => app.id)
    const registry = openableApps.map((app) => app.id).filter((id) => shown.includes(id))
    expect(shown).toEqual(registry)
  })
})
