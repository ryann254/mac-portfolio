import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { findTells, visibleText } from '@/lib/copy-tells'
import GlobalError from './global-error'

/**
 * The one screen on the site a reader can only reach by something going wrong,
 * so it is read here rather than in a browser. `scripts/copy-check.ts` cannot
 * see it: the `_global-error.html` the build writes is Next's own 500 page, not
 * this component.
 */
const markup = () => renderToStaticMarkup(<GlobalError reset={() => {}} />)

describe('the page a crash lands on', () => {
  it('says what happened in plain words', () => {
    expect(visibleText(markup())).toContain('The desktop did not come up')
  })

  it('leaves a way out: the button, and the CV as a plain file', () => {
    const html = markup()

    expect(html).toContain('Try again')
    expect(html).toContain('href="/resume.pdf"')
  })

  it('carries its own document, because the layout is gone by then', () => {
    expect(markup()).toMatch(/^<html/)
  })

  it('reads like Ryan wrote it', () => {
    const text = visibleText(markup())

    expect(findTells(text)).toEqual([])
  })
})
