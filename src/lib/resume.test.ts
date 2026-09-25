import { describe, expect, it } from 'vitest'
import { experience, profile } from '@/content'
import { escapeHtml, resumeHtml } from './resume'

const html = resumeHtml('data:font/woff2;base64,')

describe('the resume', () => {
  /**
   * The resume this replaced ended its summary with a sentence about wanting a
   * job at one named company. It went out as an attachment to that company, so
   * it was fine. On a portfolio anyone can download, it is not.
   */
  it('is addressed to nobody', () => {
    const addressed = [
      /seeking a[n]? \w+ position/i,
      /your (mission|team|company|organisation|organization)/i,
      /dear hiring manager/i,
      /I am (eager|excited) to (join|bring)/i,
      /\bmoniepoint\b/i,
    ]
    expect(addressed.filter((pattern) => pattern.test(html))).toEqual([])
  })

  it('names every role the site knows about, newest first', () => {
    const positions = experience.map((role) => html.indexOf(role.company))
    expect(positions.every((at) => at > -1)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })

  it('says how to reach him, the same way the site does', () => {
    expect(html).toContain(profile.email)
    for (const link of profile.links) {
      expect(html).toContain(link.href.replace('https://', ''))
    }
  })

  it('carries the headline the site leads with, not the one on the old CV', () => {
    expect(html).toContain(profile.headline)
    expect(html).not.toMatch(/expertise|scalable solutions/i)
  })

  it('escapes content rather than letting it close a tag', () => {
    // Nothing in `src/content` carries an angle bracket today. A project named
    // "Kazi&Budget" already carries an ampersand, and one <script> in a bullet
    // would be enough, so the escaping is proved here rather than assumed.
    expect(escapeHtml('Kazi&Budget')).toBe('Kazi&amp;Budget')
    expect(escapeHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;')
  })
})
