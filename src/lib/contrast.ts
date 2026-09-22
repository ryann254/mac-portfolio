export type Rgb = readonly [number, number, number]

const channel = (value: number): number => {
  const v = value / 255
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

export const relativeLuminance = ([r, g, b]: Rgb): number =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

/** WCAG 2.1 contrast ratio, between 1 and 21. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** WCAG AA: 3 for large text, 4.5 for everything else. */
export const requiredRatio = (isLargeText: boolean): number => (isLargeText ? 3 : 4.5)
