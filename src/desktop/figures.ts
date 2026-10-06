/**
 * The numbers in a sentence, which is what a reader scanning a CV is looking
 * for and the one thing the old monospace windows buried. A year is not one of
 * them: a number counts as a figure when it carries a per cent, a plus, or a
 * thousands comma, so `29%`, `6+` and `5,000` are set apart and `2025 to now`
 * stays prose.
 */
const FIGURE = /\d[\d.,]*(?:%|\+)|\d{1,3}(?:,\d{3})+/g

export type Part = {
  readonly text: string
  /** Whether this run is a figure, which is the part the window sets apart. */
  readonly figure: boolean
}

/**
 * A sentence cut into its plain runs and its figures, in order. A sentence with
 * no numbers in it comes back as one plain run, so there is no second path for
 * the prose that has none.
 */
export function figuresIn(sentence: string): readonly Part[] {
  const parts: Part[] = []
  let at = 0
  for (const match of sentence.matchAll(FIGURE)) {
    if (match.index > at) parts.push({ text: sentence.slice(at, match.index), figure: false })
    parts.push({ text: match[0], figure: true })
    at = match.index + match[0].length
  }
  if (at < sentence.length) parts.push({ text: sentence.slice(at), figure: false })
  return parts
}
