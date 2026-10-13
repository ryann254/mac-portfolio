import type { Block, Fact, Mark } from './file-tree'
import { fileAt } from './file-tree'
import { lettermarkColour } from './lettermark'
import { MissingFile } from './missing-file'
import { Prose } from './prose'
import type { Target } from './routes'

/**
 * A text file, opened from Finder, set as the document it is rather than as the
 * paragraphs it used to be dumped into. The title, the line under it and the
 * blocks all come out of `file-tree.ts`, so what a role is made of is decided in
 * one place and drawn here.
 *
 * The first paragraph of any document reads as its opening line, which is true
 * of the intro and of a project's tagline alike, so it is the one rule rather
 * than a kind of block of its own.
 */
export function TextWindow({ target }: { target: Target }) {
  const file = target.showing === undefined ? undefined : fileAt(target.showing)
  if (file?.kind !== 'text') return <MissingFile />

  return (
    <article className="h-full overflow-auto px-8 py-7">
      {file.mark && <Letterhead mark={file.mark} />}
      <h2 className="font-[650] text-[21px] text-zinc-900 tracking-[-0.02em] dark:text-zinc-50">
        {file.title}
      </h2>
      {file.subtitle && (
        <p className="mt-1 text-[12.5px] text-zinc-500 dark:text-zinc-400">{file.subtitle}</p>
      )}
      <hr className="my-[18px] border-black/10 dark:border-white/10" />
      {file.blocks.map((block, at) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a file's blocks never reorder, and two of them are allowed to read the same.
        <Written key={`${file.path}-${at}`} block={block} lead={at === 0} />
      ))}
    </article>
  )
}

/**
 * The company's own mark above the title, the way a letter from them would
 * carry it. Both kinds get the same tile, so the band above a role's title is
 * the same height whether the company still has a site or not.
 *
 * A logo keeps a white tile in both themes: every one of these was drawn for a
 * white page and two of the four are near-black, so a tile that followed the
 * theme would have the marks taking turns disappearing. Initials bring their
 * own colour and are set in white on it, which `tests/finder.spec.ts` holds to
 * 4.5:1 for whichever hue the name lands on.
 *
 * Neither is read out: the line under the title already names the company, and
 * a screen reader saying `Streamlyne logo` immediately before `Streamlyne` says
 * it twice.
 */
function Letterhead({ mark }: { mark: Mark }) {
  if (mark.kind === 'letters') {
    return (
      <div
        data-logo
        aria-hidden="true"
        style={{ backgroundColor: lettermarkColour(mark.hue) }}
        className="mb-3.5 flex h-9 min-w-9 w-fit items-center justify-center rounded-[7px] px-2.5 font-[680] text-[15px] text-white tracking-[0.04em]"
      >
        {mark.text}
      </div>
    )
  }

  return (
    <div
      data-logo
      className="mb-3.5 flex h-9 w-fit items-center rounded-[7px] bg-white px-2.5 ring-1 ring-black/10 ring-inset dark:ring-white/15"
    >
      {/* biome-ignore lint/performance/noImgElement: drawn art the optimiser refuses outright without dangerouslyAllowSVG. */}
      <img src={mark.src} alt="" className="h-6 w-auto" />
    </div>
  )
}

/** One block, in the shape its kind asks for. */
function Written({ block, lead }: { block: Block; lead: boolean }) {
  switch (block.kind) {
    case 'paragraph':
      return <Said text={block.text} lead={lead} />
    case 'list':
      return <Bullets items={block.items} />
    case 'tags':
      return (
        <>
          <Label text={block.label} />
          <Chips items={block.items} />
        </>
      )
    case 'section':
      return <Label text={block.label} />
    case 'facts':
      return <Facts rows={block.rows} />
  }
}

/** A paragraph, set a size larger when it is the one the document opens on. */
function Said({ text, lead }: { text: string; lead: boolean }) {
  return (
    <p
      className={
        lead
          ? 'mb-[15px] max-w-[66ch] text-[15px]/[1.6] text-zinc-800 dark:text-zinc-200'
          : 'mb-[13px] max-w-[64ch] text-[14px]/[1.72] text-zinc-700 dark:text-zinc-300'
      }
    >
      <Prose sentence={text} />
    </p>
  )
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul role="list" className="max-w-[66ch]">
      {items.map((item) => (
        <li
          key={item}
          className="relative mb-[13px] pl-5 text-[13.5px]/[1.7] text-zinc-700 before:absolute before:top-[0.62em] before:left-[3px] before:size-[5px] before:rounded-full before:bg-sky-600/75 before:content-[''] dark:text-zinc-300 dark:before:bg-sky-400/75"
        >
          <Prose sentence={item} />
        </li>
      ))}
    </ul>
  )
}

/** What names the thing under it, whether that is a set of chips or prose. */
function Label({ text }: { text: string }) {
  return (
    <p className="mt-5 mb-2 text-[11px] text-zinc-500 uppercase tracking-[0.08em] dark:text-zinc-400">
      {text}
    </p>
  )
}

/** A set of short words, which is what a stack and a skill group both are. */
function Chips({ items }: { items: readonly string[] }) {
  return (
    <ul role="list" className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-full bg-black/[0.06] px-2.5 py-[3px] text-[11.5px] text-zinc-500 dark:bg-white/10 dark:text-zinc-400"
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

/**
 * Everything known about a project, in the panel macOS puts facts in. This is
 * what a project's readme has and a role's file does not, because the two were
 * otherwise one document: a title, a line under it, and a list.
 *
 * A row wraps rather than squeezes. The narrowest this window gets is a phone
 * filling 390px, where `Built for` and the company beside it have about 290px
 * between them, and a stack of six chips needs the whole of it.
 */
function Facts({ rows }: { rows: readonly Fact[] }) {
  return (
    <dl
      data-facts
      className="my-[18px] max-w-[66ch] rounded-[10px] bg-black/[0.04] px-[15px] dark:bg-white/[0.06]"
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-black/[0.07] border-b-[0.5px] py-[10px] last:border-b-0 dark:border-white/[0.09]"
        >
          <dt className="w-[76px] shrink-0 text-[11px] text-zinc-500 uppercase tracking-[0.06em] dark:text-zinc-400">
            {row.label}
          </dt>
          <dd className="min-w-0 flex-1 text-[13px] text-zinc-800 dark:text-zinc-200">
            <Says row={row} />
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** What a row says, which is a different thing to draw for every kind of fact. */
function Says({ row }: { row: Fact }) {
  switch (row.kind) {
    case 'says':
      return row.text
    case 'link':
      return (
        <a
          href={row.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 hover:underline dark:text-sky-400"
        >
          {new URL(row.href).host}
        </a>
      )
    case 'figures':
      return (
        <ul role="list" className="flex flex-col gap-[3px]">
          {row.items.map((figure) => (
            <li key={figure.of} data-result={figure.value} className="flex items-baseline gap-2">
              <b className="font-[680] text-[15px] text-sky-700 tracking-[-0.01em] dark:text-sky-400">
                {figure.value}
              </b>
              <span className="text-[12.5px] text-zinc-500 dark:text-zinc-400">{figure.of}</span>
            </li>
          ))}
        </ul>
      )
    case 'tags':
      return <Chips items={row.items} />
  }
}
