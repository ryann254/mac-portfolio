import { statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { profile } from '@/content'
import { RESUME_FILE, RESUME_NAME, RESUME_VIEW } from './resume-file'

describe('the file Resume shows', () => {
  it('lands in Downloads under his name', () => {
    expect(RESUME_NAME).toBe('ryan-waweru.pdf')
    expect(RESUME_NAME).toBe(`${profile.name.toLowerCase().replace(/\s+/g, '-')}.pdf`)
  })

  /** The button is only worth having if there is a file on the other end of it. */
  it('is a PDF that `pnpm resume` has actually printed', () => {
    const file = statSync(`public${RESUME_FILE}`)
    expect(file.isFile()).toBe(true)
    expect(file.size).toBeGreaterThan(10_000)
  })

  it('opens fitted to the width of the window, and downloads without the fragment', () => {
    expect(RESUME_VIEW.startsWith(`${RESUME_FILE}#`)).toBe(true)
    expect(RESUME_FILE).not.toContain('#')
  })
})
