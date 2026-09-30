import { fileAt } from './file-tree'
import { MissingFile } from './missing-file'
import type { Target } from './routes'

/**
 * A text file, opened from Finder. No toolbar, only the title bar, because a
 * TextEdit window opened on a file has nothing else. Monospaced on purpose: it
 * is meant to read like a file rather than like a web page.
 */
export function TextWindow({ target }: { target: Target }) {
  const file = target.showing === undefined ? undefined : fileAt(target.showing)
  if (file?.kind !== 'text') return <MissingFile />

  return (
    <div className="h-full space-y-4 overflow-auto px-[22px] py-[18px] font-mono text-[12.5px]/[1.7] text-zinc-700 dark:text-zinc-300">
      {file.text.map((paragraph, at) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a file's paragraphs never reorder, and two of them are allowed to read the same.
        <p key={`${file.path}-${at}`} className="whitespace-pre-line">
          {paragraph}
        </p>
      ))}
    </div>
  )
}
