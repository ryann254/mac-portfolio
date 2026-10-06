import { describe, expect, it } from 'vitest'
import { experience, profile, projects } from '@/content'
import {
  around,
  contentsOf,
  fileAt,
  folderAt,
  HOME,
  isDrawn,
  isMissingFolder,
  nameAt,
  nodeAt,
  parentOf,
  rootOf,
  searchIn,
} from './file-tree'
import { locations } from './locations'

const names = (path: string) => contentsOf(path).map((node) => node.name)

describe('the tree Finder browses', () => {
  it('starts at the four folders the sidebar has, and nowhere above them', () => {
    for (const location of locations) {
      expect(folderAt(location.slug)?.name, location.slug).toBe(location.name)
      expect(parentOf(location.slug), location.slug).toBeUndefined()
    }
    expect(HOME).toBe(locations[0].slug)
  })

  /**
   * The derivation is the point of the module: a project added to the content
   * has to turn up as a folder and a role as a file, with nobody typing either
   * name. Counting against the content is what proves nothing was written here.
   */
  it('has a folder per project, holding its readme and its screenshot', () => {
    expect(names('projects')).toEqual(projects.map((project) => project.name))
    for (const project of projects) {
      const path = `projects/${project.slug}`
      expect(names(path), path).toEqual(['readme.txt', `${project.slug}.png`])
      expect(parentOf(path)).toBe('projects')
    }
  })

  it('has a file per role, named after the role', () => {
    expect(names('experience')).toEqual(experience.map((role) => `${role.slug}.txt`))
  })

  it('has the intro and the skills the content has', () => {
    expect(names('about')).toEqual(['about.txt', 'avatar.svg'])
    expect(names('skills')).toEqual(['skills.txt'])
    expect(fileAt('about/about.txt')).toMatchObject({
      kind: 'text',
      title: profile.name,
      blocks: profile.summary.map((text) => ({ kind: 'paragraph', text })),
    })
    const skills = fileAt('skills/skills.txt')
    expect(skills?.kind === 'text' && skills.blocks).toEqual(
      profile.skillGroups.map((group) => ({
        kind: 'tags',
        label: group.name,
        items: group.skills,
      })),
    )
  })

  it('writes a role file out of the role, down to the last bullet', () => {
    const role = experience[0]
    const file = fileAt(`experience/${role.slug}.txt`)
    expect(file).toMatchObject({
      kind: 'text',
      title: role.title,
      blocks: [{ kind: 'list', items: role.bullets }],
    })
    expect(file?.kind === 'text' && file.subtitle).toContain(role.company)
  })

  it('writes a readme out of the project, with its link and its stack', () => {
    const project = projects[0]
    const file = fileAt(`projects/${project.slug}/readme.txt`)
    expect(file).toMatchObject({
      kind: 'text',
      title: project.name,
      link: project.url,
      blocks: [
        { kind: 'paragraph', text: project.tagline },
        { kind: 'list', items: project.contribution },
        { kind: 'tags', label: 'Stack', items: project.stack },
      ],
    })
  })

  it('says when a role is still running and when it ended', () => {
    const current = experience.find((role) => role.end === undefined)
    const past = experience.find((role) => role.end !== undefined)
    const said = (slug: string) => {
      const file = fileAt(`experience/${slug}.txt`)
      return file?.kind === 'text' ? file.subtitle : ''
    }
    expect(current && said(current.slug)).toContain('to now')
    expect(past && said(past.slug)).not.toContain('to now')
  })

  it('points every file at something, and every screenshot at its project', () => {
    for (const project of projects) {
      const shot = fileAt(`projects/${project.slug}/${project.slug}.png`)
      expect(shot, project.slug).toMatchObject({ kind: 'image', src: project.thumbnail })
    }
    const avatar = fileAt('about/avatar.svg')
    expect(avatar?.kind === 'image' && isDrawn(avatar)).toBe(true)
  })

  it('gives every node one path, and every path leads back to that node', () => {
    const walk = (path: string): string[] => [
      path,
      ...contentsOf(path).flatMap((node) => walk(node.path)),
    ]
    const everyPath = locations.flatMap((location) => walk(location.slug))
    expect(new Set(everyPath).size).toBe(everyPath.length)
    for (const path of everyPath) expect(nodeAt(path)?.path, path).toBe(path)
  })

  it('marks the sidebar folder whatever it is looking at sits under', () => {
    expect(rootOf('projects')).toBe('projects')
    expect(rootOf(`projects/${projects[0].slug}`)).toBe('projects')
    expect(rootOf('nowhere')).toBe('nowhere')
  })

  it('calls a window on a folder that is not there a miss, and only Finder', () => {
    expect(isMissingFolder({ app: 'finder', showing: 'hobbies' })).toBe(true)
    expect(isMissingFolder({ app: 'finder', showing: 'about' })).toBe(false)
    expect(isMissingFolder({ app: 'finder' })).toBe(false)
    expect(isMissingFolder({ app: 'safari', showing: 'hobbies' })).toBe(false)
  })

  it('is a folder or a file, never both', () => {
    expect(folderAt('about/about.txt')).toBeUndefined()
    expect(fileAt('about')).toBeUndefined()
    expect(nameAt('about/about.txt')).toBe('about.txt')
    expect(nameAt('nowhere')).toBeUndefined()
  })
})

describe('searching a folder', () => {
  it('finds what is in this folder and nothing from another', () => {
    expect(searchIn('experience', 'stream').map((node) => node.name)).toEqual(['streamlyne.txt'])
    expect(searchIn('experience', 'readme')).toEqual([])
  })

  it('is the whole folder when nothing is typed, and ignores the case', () => {
    expect(searchIn('about', '')).toHaveLength(2)
    expect(searchIn('about', '   ')).toHaveLength(2)
    expect(searchIn('projects', 'SURVEVA').map((node) => node.name)).toEqual(['Surveva'])
  })

  it('cuts a name around the part that matched, so it can be drawn marked', () => {
    expect(around('about.txt', 'out')).toEqual(['ab', 'out', '.txt'])
    expect(around('about.txt', '')).toEqual(['about.txt', '', ''])
    expect(around('about.txt', 'zzz')).toEqual(['about.txt', '', ''])
  })
})
