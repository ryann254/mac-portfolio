/**
 * The net that catches writing which reads as machine made. The patterns come
 * from the humanizer skill, and `visibleText` is what to point them at when the
 * copy is in a component rather than in `content/`: the reader's half of a
 * page Next has already rendered.
 *
 * It is a net, not a judge. A hit is a line to look at.
 */

export type Tell = {
  readonly name: string
  readonly pattern: RegExp
}

export type Hit = {
  readonly tell: string
  readonly text: string
  /** Where the match starts, so the caller can name a line or quote around it. */
  readonly at: number
}

export const TELLS: readonly Tell[] = [
  { name: 'em or en dash', pattern: /[—–]/g },
  { name: 'curly quote', pattern: /[“”‘’]/g },
  { name: 'not just, not only', pattern: /\bnot (just|only|merely)\b/gi },
  {
    name: 'AI vocabulary',
    pattern:
      /\b(leverage|seamless|crucial|delve|foster|showcase|testament|underscore|pivotal|vibrant|intricate|tapestry|garner|utilize|additionally|moreover|furthermore|robust|elevate)\w*\b/gi,
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
  {
    name: 'sounds deep',
    pattern: /\b(at its core|the real question|what really matters|the deeper (issue|truth))\b/gi,
  },
  { name: 'filler', pattern: /\b(in order to|due to the fact that|it is important to note)\b/gi },
  { name: 'staged run-up', pattern: /(Let's dive|Here's the thing|Let's be honest|Real talk)/gi },
  { name: 'chatbot residue', pattern: /(I hope this helps|Great question|Certainly!)/gi },
]

/** Attributes a reader reads, or hears a screen reader say. */
const SPOKEN = /\s(?:aria-label|aria-roledescription|alt|title|placeholder)="([^"]*)"/g

const NAMED: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

const decode = (text: string): string =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => NAMED[name.toLowerCase()] ?? whole)

/**
 * The words on a page, out of the HTML that holds them. Scripts and styles go
 * first: Next inlines the same sentences again as its own payload, and a
 * stylesheet is full of dashes nobody reads. Tags go next, and the entities
 * come back last, because a decoded `<` before that would read as a tag.
 */
export function visibleText(html: string): string {
  const page = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  const spoken = [...page.matchAll(SPOKEN)].map(([, value]) => value)
  return decode([page.replace(/<[^>]*>/g, ' '), ...spoken].join('\n'))
}

export function findTells(text: string): Hit[] {
  return TELLS.flatMap((tell) =>
    [...text.matchAll(tell.pattern)].map((match) => ({
      tell: tell.name,
      text: match[0],
      at: match.index,
    })),
  )
}

/** The words either side of a hit, so the output says enough to judge it. */
export function quote(text: string, at: number, width = 70): string {
  const from = Math.max(0, at - width / 2)
  return text
    .slice(from, from + width)
    .replace(/\s+/g, ' ')
    .trim()
}
