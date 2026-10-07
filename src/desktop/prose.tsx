import { Fragment } from 'react'
import { figuresIn } from './figures'

/**
 * One sentence, with its figures set apart. Both the text windows and Safari
 * read through here, so a number looks the same wherever it is written.
 */
export function Prose({ sentence }: { sentence: string }) {
  return (
    <>
      {figuresIn(sentence).map((part, at) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the runs of one sentence never reorder, and two of them are allowed to read the same.
        <Fragment key={`${at}-${part.text}`}>
          {part.figure ? (
            <b className="font-[620] text-zinc-900 dark:text-zinc-50">{part.text}</b>
          ) : (
            part.text
          )}
        </Fragment>
      ))}
    </>
  )
}
