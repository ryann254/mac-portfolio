import { experience, profile, projects } from '@/content'
import type { Project, Role, YearMonth } from '@/content/types'
import type { AppId } from './apps'
import { locations } from './locations'
import { altOf, employerOf } from './project-view'

/**
 * What Finder browses. Every folder and every file is derived from
 * `src/content`, so a role added to the CV turns up as a file and a project as
 * a folder with no edit here: nothing below writes a filename, only a slug out
 * of the content modules with an extension on it.
 *
 * A node's path is where it is. The four folders in the sidebar have a single
 * segment and are the four that also have a URL; everything under them is
 * reached through Finder and has no address of its own, which is why `routes.ts`
 * still generates addresses from `locations` and not from here.
 */

export type Folder = {
  readonly kind: 'folder'
  readonly path: string
  readonly name: string
  /** Absent for the four in the sidebar, which are where Finder starts. */
  readonly parent?: string
}

export type TextFile = {
  readonly kind: 'text'
  readonly path: string
  readonly name: string
  readonly parent: string
  /** One paragraph each. A newline inside one is kept, the way a file keeps it. */
  readonly text: readonly string[]
}

export type ImageFile = {
  readonly kind: 'image'
  readonly path: string
  readonly name: string
  readonly parent: string
  readonly src: string
  readonly alt: string
}

export type Node = Folder | TextFile | ImageFile

/** Anything in a folder that is not another folder, which is what opens a window. */
export type FileNode = TextFile | ImageFile

/** `2025-07` reads as `July 2025`, which is how a sentence says it. */
const said = (value: YearMonth): string => {
  const [year, month] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const span = (role: Role): string => `${said(role.start)} to ${role.end ? said(role.end) : 'now'}`

const folder = (path: string, name: string, parent?: string): Folder => ({
  kind: 'folder',
  path,
  name,
  parent,
})

const textFile = (parent: string, name: string, text: readonly string[]): TextFile => ({
  kind: 'text',
  path: `${parent}/${name}`,
  name,
  parent,
  text,
})

const imageFile = (parent: string, name: string, src: string, alt: string): ImageFile => ({
  kind: 'image',
  path: `${parent}/${name}`,
  name,
  parent,
  src,
  alt,
})

const roleFile = (role: Role): TextFile =>
  textFile('experience', `${role.slug}.txt`, [
    [role.title, role.company, span(role), `${role.location}, ${role.arrangement}`].join('\n'),
    ...role.bullets.map((bullet) => `- ${bullet}`),
  ])

const readme = (project: Project): TextFile =>
  textFile(`projects/${project.slug}`, 'readme.txt', [
    [project.name, project.url, project.period, employerOf(project)].join('\n'),
    project.tagline,
    ...project.contribution.map((line) => `- ${line}`),
    `Stack\n${project.stack.join(', ')}`,
  ])

const skillsFile = (): TextFile =>
  textFile(
    'skills',
    'skills.txt',
    profile.skillGroups.map((group) => `${group.name}\n${group.skills.join(', ')}`),
  )

/**
 * Every node, in the order a folder lists its contents. Folders come from the
 * sidebar, the rest from the content, so the only way to add a file is to add
 * the thing it is about.
 */
const nodes: readonly Node[] = [
  ...locations.map((location) => folder(location.slug, location.name)),

  textFile('about', 'about.txt', profile.summary),
  imageFile('about', 'avatar.svg', '/about/avatar.svg', 'A drawn stand-in for a photograph'),

  ...projects.flatMap((project): readonly Node[] => [
    folder(`projects/${project.slug}`, project.name, 'projects'),
    readme(project),
    imageFile(`projects/${project.slug}`, `${project.slug}.png`, project.thumbnail, altOf(project)),
  ]),

  ...experience.map(roleFile),

  skillsFile(),
]

const index: ReadonlyMap<string, Node> = new Map(nodes.map((node) => [node.path, node]))

/** Where Finder opens when the address names no folder: the first in the sidebar. */
export const HOME: string = locations[0].slug

export const nodeAt = (path: string): Node | undefined => index.get(path)

export const isFolder = (node: Node): node is Folder => node.kind === 'folder'

export const folderAt = (path: string): Folder | undefined => {
  const node = nodeAt(path)
  return node !== undefined && isFolder(node) ? node : undefined
}

export const fileAt = (path: string): FileNode | undefined => {
  const node = nodeAt(path)
  return node === undefined || isFolder(node) ? undefined : node
}

/** What a folder holds, in order. Empty for a file, and for a folder that is not there. */
export const contentsOf = (path: string): readonly Node[] =>
  nodes.filter((node) => node.parent === path)

/** The folder above this one. Absent at the four the sidebar starts from. */
export const parentOf = (path: string): string | undefined => nodeAt(path)?.parent

/**
 * A drawn image scales to any size on its own, so the optimiser has nothing to
 * do with it and refuses SVG outright without `dangerouslyAllowSVG`. A
 * screenshot is a megabyte of pixels that has to be resized before it is drawn
 * at 54 px, so that one goes through `next/image`.
 */
export const isDrawn = (file: ImageFile): boolean => file.src.endsWith('.svg')

/** What a window on this path is called: the folder, or the file, by its own name. */
export const nameAt = (path: string): string | undefined => nodeAt(path)?.name

/** The folder in the sidebar this one sits under, which is the one the sidebar marks. */
export const rootOf = (path: string): string => {
  const parent = parentOf(path)
  return parent === undefined ? path : rootOf(parent)
}

/**
 * Finder at a folder the tree does not have, which is what an address nothing
 * answers to opens. No other window can be on something missing: the text and
 * image windows are only ever opened by Finder, on a file it just listed.
 */
export const isMissingFolder = (window: {
  readonly app: AppId
  readonly showing?: string
}): boolean =>
  window.app === 'finder' && window.showing !== undefined && folderAt(window.showing) === undefined

/** What a folder holds that a reader is looking for. An empty search is everything. */
export const searchIn = (path: string, query: string): readonly Node[] => {
  const want = query.trim().toLowerCase()
  return contentsOf(path).filter((node) => node.name.toLowerCase().includes(want))
}

/**
 * A name cut into the part before the search, the part that matched, and the
 * part after, so the match can be drawn marked. Nothing matched means the whole
 * name is the first part.
 */
export const around = (name: string, query: string): readonly [string, string, string] => {
  const want = query.trim()
  const at = want === '' ? -1 : name.toLowerCase().indexOf(want.toLowerCase())
  if (at < 0) return [name, '', '']
  return [name.slice(0, at), name.slice(at, at + want.length), name.slice(at + want.length)]
}
