/**
 * Points the copy net at both surfaces the site's words live on: the content
 * modules, and the pages the build has already rendered, which is where a
 * string written inside a component turns up. The patterns and the text
 * extraction are in `src/lib/copy-tells.ts`, where they are tested; this reads
 * the files and prints what to look at.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { findTells, quote, visibleText } from '../src/lib/copy-tells'

const CONTENT = 'src/content'
const PAGES = '.next/server/app'

/**
 * Next's own 500 page. The `_global-error` route is wired to
 * `next/dist/client/components/builtin/app-error.js` by the app loader whatever
 * the app provides, so its words are the framework's and cannot be written
 * here. `src/app/global-error.tsx` is ours, it is the boundary a reader hits
 * when the app itself throws, and `global-error.test.tsx` runs this same net
 * over it.
 */
const FRAMEWORKS_OWN = '_global-error.html'

type Surface = {
  /** What the output says to find a hit: a file and a line, or an address. */
  readonly label: (at: number) => string
  readonly text: string
}

async function filesUnder(dir: string, keep: (name: string) => boolean): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return filesUnder(path, keep)
      return keep(entry.name) ? [path] : []
    }),
  )
  return nested.flat()
}

const isContent = (name: string): boolean => name.endsWith('.ts') && !name.endsWith('.test.ts')

const address = (file: string): string => {
  const route = relative(PAGES, file)
    .replace(/\.html$/, '')
    .split(sep)
    .join('/')
  return route === 'index' ? '/' : `/${route}`
}

async function readModule(file: string): Promise<Surface> {
  const text = await readFile(file, 'utf8')
  return { text, label: (at) => `${file}:${text.slice(0, at).split('\n').length}` }
}

async function readPage(file: string): Promise<Surface> {
  const text = visibleText(await readFile(file, 'utf8'))
  const where = address(file)
  return { text, label: () => where }
}

async function main(): Promise<void> {
  const modules = await filesUnder(CONTENT, isContent)
  const pages = await filesUnder(PAGES, (name) => name.endsWith('.html') && name !== FRAMEWORKS_OWN)
  const surfaces = await Promise.all([...modules.map(readModule), ...pages.map(readPage)])

  let hits = 0
  for (const surface of surfaces) {
    for (const hit of findTells(surface.text)) {
      console.log(`  ${surface.label(hit.at)}  ${hit.tell}: ${quote(surface.text, hit.at)}`)
      hits += 1
    }
  }

  console.log(`  ${modules.length} content files, ${pages.length} pages`)
  if (pages.length === 0) {
    console.log('  no build to read. run pnpm build and this covers the pages too')
  }
  console.log(hits === 0 ? '  clean' : `\n  ${hits} to look at`)
  if (hits > 0) process.exit(1)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
