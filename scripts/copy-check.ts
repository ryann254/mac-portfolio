/**
 * Greps the content modules for the patterns that make writing read as machine
 * made. It is a net, not a judge: a hit is something to look at, and the list
 * comes from the humanizer skill. Phase 11 points the same net at the built
 * HTML so copy added inside components is covered too.
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

type Tell = { name: string; pattern: RegExp }

const TELLS: readonly Tell[] = [
  { name: 'em or en dash', pattern: /[—–]/g },
  { name: 'curly quote', pattern: /[“”‘’]/g },
  { name: 'not just, not only', pattern: /\bnot (just|only|merely)\b/gi },
  {
    name: 'AI vocabulary',
    pattern:
      /\b(leverage|seamless|crucial|delve|foster|showcase|testament|underscore|pivotal|vibrant|intricate|tapestry|garner|utilize)\w*\b/gi,
  },
  {
    name: 'sales language',
    pattern: /\b(nestled|boasts|renowned|breathtaking|stunning|must-visit|commitment to)\b/gi,
  },
  { name: 'fancy is', pattern: /\b(serves as|stands as|functions as)\b/gi },
  {
    name: 'shallow -ing rider',
    pattern: /\b(highlighting|underscoring|emphasizing|showcasing|symbolizing|fostering)\b/gi,
  },
  { name: 'staged run-up', pattern: /(Let's dive|Here's the thing|Let's be honest|Real talk)/gi },
  { name: 'chatbot residue', pattern: /(I hope this helps|Great question|Certainly!)/gi },
]

async function filesUnder(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return filesUnder(path)
      return entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') ? [path] : []
    }),
  )
  return nested.flat()
}

async function main(): Promise<void> {
  const files = await filesUnder('src/content')
  let hits = 0

  for (const file of files) {
    const text = await readFile(file, 'utf8')
    for (const tell of TELLS) {
      for (const match of text.matchAll(tell.pattern)) {
        const line = text.slice(0, match.index).split('\n').length
        console.log(`  ${file}:${line}  ${tell.name}: "${match[0]}"`)
        hits += 1
      }
    }
  }

  console.log(hits === 0 ? `  clean, ${files.length} files` : `\n  ${hits} to look at`)
  if (hits > 0) process.exit(1)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
