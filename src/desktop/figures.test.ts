import { describe, expect, it } from 'vitest'
import { experience, profile, projects } from '@/content'
import { figuresIn } from './figures'

const marked = (sentence: string) =>
  figuresIn(sentence)
    .filter((part) => part.figure)
    .map((part) => part.text)

const rebuilt = (sentence: string) =>
  figuresIn(sentence)
    .map((part) => part.text)
    .join('')

describe('figuresIn', () => {
  it('gives back every word it was handed, in order', () => {
    const everything = [
      ...profile.summary,
      ...experience.flatMap((role) => role.bullets),
      ...projects.flatMap((project) => project.contribution),
    ]
    for (const sentence of everything) expect(rebuilt(sentence)).toBe(sentence)
  })

  it('marks a percentage', () => {
    expect(marked('Research submissions went up 29%.')).toEqual(['29%'])
  })

  it('marks a number that says "and more"', () => {
    expect(marked('6+ years of React')).toEqual(['6+'])
  })

  it('marks a thousand', () => {
    expect(marked('publishing to more than 5,000 students')).toEqual(['5,000'])
  })

  it('leaves a year alone, which is a date and not a figure', () => {
    expect(marked('Streamlyne, July 2025 to now')).toEqual([])
    expect(marked('2023')).toEqual([])
  })

  it('marks every figure in a sentence that holds two', () => {
    expect(marked('cut load times 44% and lifted submissions 29%')).toEqual(['44%', '29%'])
  })

  it('hands back one plain run for a sentence with no numbers at all', () => {
    expect(figuresIn('Courses and books for working developers.')).toEqual([
      { text: 'Courses and books for working developers.', figure: false },
    ])
  })

  it('finds the figures the CV actually has', () => {
    const inTheCv = [...profile.summary, ...experience.flatMap((role) => role.bullets)].flatMap(
      marked,
    )
    expect(inTheCv).toContain('29%')
    expect(inTheCv).toContain('44%')
    expect(inTheCv).toContain('25%')
  })
})
