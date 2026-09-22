import { describe, expect, it } from 'vitest'
import { BUDGET, checkBudget, emptyMeasurement, formatKb, isOverBudget } from './budget'

const measurement = (over: Partial<ReturnType<typeof emptyMeasurement>>) => ({
  ...emptyMeasurement(),
  ...over,
})

describe('checkBudget', () => {
  it('passes a load that sits under both limits', () => {
    const rows = checkBudget(measurement({ script: 80_000, total: 300_000 }))

    expect(isOverBudget(rows)).toBe(false)
  })

  it('fails when javascript alone blows its limit', () => {
    const rows = checkBudget(measurement({ script: BUDGET.script + 1, total: 300_000 }))

    expect(rows.find((row) => row.name === 'javascript')?.over).toBe(true)
    expect(isOverBudget(rows)).toBe(true)
  })

  it('fails when the total blows its limit even with small javascript', () => {
    const rows = checkBudget(measurement({ script: 1_000, total: BUDGET.total + 1 }))

    expect(rows.find((row) => row.name === 'total transfer')?.over).toBe(true)
  })

  it('treats a load exactly on the limit as passing', () => {
    const rows = checkBudget(measurement({ script: BUDGET.script, total: BUDGET.total }))

    expect(isOverBudget(rows)).toBe(false)
  })
})

describe('formatKb', () => {
  it('reports bytes in kB to one decimal', () => {
    expect(formatKb(153_600)).toBe('153.6 kB')
  })
})
