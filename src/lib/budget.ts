export type ResourceKind = 'document' | 'script' | 'stylesheet' | 'image' | 'font' | 'other'

export type Measured = Record<ResourceKind, number> & { total: number }

export type BudgetRow = {
  name: string
  measured: number
  limit: number
  over: boolean
}

/**
 * Bytes over the wire on a cold load of `/`, from PLAN.md's performance budget.
 * React and the Next.js runtime alone account for about 135 kB of the script
 * budget before any of our code, which is why it is not tighter.
 */
export const BUDGET = {
  total: 600_000,
  script: 230_000,
} as const

export const emptyMeasurement = (): Measured => ({
  document: 0,
  script: 0,
  stylesheet: 0,
  image: 0,
  font: 0,
  other: 0,
  total: 0,
})

export function checkBudget(measured: Measured): BudgetRow[] {
  return [
    { name: 'total transfer', measured: measured.total, limit: BUDGET.total },
    { name: 'javascript', measured: measured.script, limit: BUDGET.script },
  ].map((row) => ({ ...row, over: row.measured > row.limit }))
}

export const isOverBudget = (rows: BudgetRow[]): boolean => rows.some((row) => row.over)

export const formatKb = (bytes: number): string => `${(bytes / 1000).toFixed(1)} kB`
