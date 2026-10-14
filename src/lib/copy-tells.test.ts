import { describe, expect, it } from 'vitest'
import { findTells, quote, visibleText } from './copy-tells'

const names = (html: string) => findTells(visibleText(html)).map((hit) => hit.tell)

describe('visibleText', () => {
  it('reads the words a page shows', () => {
    expect(visibleText('<h1>Ryan Waweru</h1><p>Senior Frontend Engineer</p>')).toContain(
      'Senior Frontend Engineer',
    )
  })

  it('leaves the payload Next inlines out of it', () => {
    const page = '<p>fine</p><script>self.__next_f.push("a leveraged tapestry")</script>'

    expect(names(page)).toEqual([])
  })

  it('leaves a stylesheet out of it, dashes and all', () => {
    expect(names('<style>:root{--gap:4px;font-family:"Inter"}</style><p>fine</p>')).toEqual([])
  })

  it('reads an aria-label, because a screen reader says it out loud', () => {
    expect(names('<button aria-label="Showcasing the dock">Dock</button>')).toEqual([
      'shallow -ing rider',
    ])
  })

  it('puts the apostrophes and ampersands back', () => {
    const page = '<p>Ryan&#x27;s work at Kazi&amp;Budget</p>'

    expect(visibleText(page)).toContain("Ryan's work at Kazi&Budget")
  })

  it('reads a curly quote a component smuggled in as an entity', () => {
    expect(names('<p>Ryan&#8217;s work</p>')).toEqual(['curly quote'])
  })

  it('does not let a decoded angle bracket eat the words after it', () => {
    expect(visibleText('<p>&lt;tapestry&gt; stands as proof</p>')).toContain('<tapestry>')
  })
})

describe('findTells', () => {
  it('catches every em dash in the prose, not the first one only', () => {
    expect(findTells('The dock — every app on it — slides up').map((hit) => hit.text)).toEqual([
      '—',
      '—',
    ])
  })

  it('catches the not-just contrast whatever the case', () => {
    expect(names('<p>Not only a portfolio but a desktop</p>')).toEqual(['not just, not only'])
  })

  it('says nothing about copy that reads like a person wrote it', () => {
    expect(findTells('Six years of React, mostly in education and real estate.')).toEqual([])
  })

  it('reports where the hit is, so the caller can name the place', () => {
    const [hit] = findTells('a seamless experience')

    expect(hit?.at).toBe(2)
  })
})

describe('quote', () => {
  it('gives the words either side of the hit, on one line', () => {
    const text = 'The window opens.\nIt is a seamless thing.\nThen it closes.'
    const [hit] = findTells(text)

    const line = quote(text, hit?.at ?? 0)

    expect(line).toContain('seamless thing')
    expect(line).not.toContain('\n')
  })
})
