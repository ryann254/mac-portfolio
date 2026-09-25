/**
 * The resume, as one HTML document, built from the same typed content the site
 * renders. `scripts/build-resume.ts` prints it to `public/resume.pdf`.
 *
 * It names no employer. The version this replaced closed its summary with a
 * sentence about wanting to work at one company in particular, which is exactly
 * the sentence you do not want on a public portfolio, and the reason this is
 * generated rather than exported by hand: a resume that drifts from the site is
 * worse than no resume, because a recruiter reads both.
 */
import { experience, profile } from '@/content'
import type { Role } from '@/content/types'

/** `2025-07` reads as `07/2025`, the way a resume writes it. */
const month = (value: string): string => {
  const [year, m] = value.split('-')
  return `${m}/${year}`
}

const when = (role: Role): string =>
  `${month(role.start)} - ${role.end ? month(role.end) : 'Present'}`

export const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const roleBlock = (role: Role): string => `
  <article class="role">
    <h3>${escapeHtml(role.title)}</h3>
    <p class="company">${escapeHtml(role.company)}</p>
    <p class="meta">${when(role)} &nbsp;·&nbsp; ${escapeHtml(role.location)} &nbsp;|&nbsp; ${escapeHtml(role.arrangement)}</p>
    <ul>${role.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>
  </article>`

export const resumeHtml = (fontDataUri: string): string => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(profile.name)}</title>
<style>
  @font-face {
    font-family: "Inter";
    font-weight: 100 900;
    src: url("${fontDataUri}") format("woff2");
  }
  @page { size: A4; margin: 13mm 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "Inter", system-ui, sans-serif;
    font-size: 9.1pt;
    line-height: 1.42;
    color: #1d1d1f;
  }
  header { margin-bottom: 14px; }
  h1 { margin: 0; font-size: 22pt; font-weight: 700; letter-spacing: -0.01em; text-transform: uppercase; }
  .headline { margin: 3px 0 0; font-size: 10.5pt; font-weight: 600; color: #1473e6; }
  .contact { margin: 7px 0 0; font-size: 8.4pt; color: #3c3c43; }
  .contact span + span::before { content: "·"; margin: 0 7px; color: #9a9aa2; }
  .columns { display: flex; gap: 22px; align-items: flex-start; }
  .main { flex: 1 1 60%; }
  .side { flex: 1 1 40%; }
  h2 {
    margin: 0 0 7px;
    padding-bottom: 3px;
    border-bottom: 1.4px solid #1d1d1f;
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.01em;
    text-transform: uppercase;
  }
  section + section { margin-top: 13px; }
  .role { padding-bottom: 8px; margin-bottom: 8px; border-bottom: 1px dashed #d4d4d8; break-inside: avoid; }
  .role:last-child { border-bottom: 0; }
  .role h3 { margin: 0; font-size: 9.9pt; font-weight: 700; }
  .company { margin: 1px 0 0; font-size: 9.4pt; font-weight: 600; color: #1473e6; }
  .meta { margin: 2px 0 4px; font-size: 8.1pt; color: #55555d; }
  ul { margin: 0; padding-left: 13px; }
  li { margin-bottom: 2.5px; }
  .summary p { margin: 0 0 6px; }
  .summary p:last-child { margin-bottom: 0; }
  .win { margin-bottom: 7px; break-inside: avoid; }
  .win b { display: block; font-size: 9.3pt; }
  .win span { color: #3c3c43; }
  .group { margin-bottom: 7px; }
  .group b { display: block; font-size: 8.7pt; color: #1473e6; margin-bottom: 3px; }
  .tags { display: flex; flex-wrap: wrap; gap: 4px; }
  .tag { border-bottom: 1.2px solid #c9c9d0; padding: 0 1px 1px; font-size: 8.3pt; }
  .line { margin-bottom: 5px; }
  .line b { display: block; font-size: 9.1pt; }
  .line span { font-size: 8.4pt; color: #1473e6; font-weight: 600; }
</style></head>
<body>
  <header>
    <h1>${escapeHtml(profile.name)}</h1>
    <p class="headline">${escapeHtml(profile.headline)} &nbsp;|&nbsp; React, TypeScript, Next.js &nbsp;|&nbsp; Real-time web applications</p>
    <p class="contact">
      <span>${escapeHtml(profile.email)}</span>${profile.links
        .map((link) => `<span>${escapeHtml(link.href.replace('https://', ''))}</span>`)
        .join('')}<span>${escapeHtml(profile.location)}</span>
    </p>
  </header>
  <div class="columns">
    <div class="main">
      <section>
        <h2>Experience</h2>
        ${experience.map(roleBlock).join('')}
      </section>
    </div>
    <div class="side">
      <section class="summary">
        <h2>Summary</h2>
        ${profile.summary.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      </section>
      <section>
        <h2>Achievements</h2>
        ${profile.achievements
          .map(
            (win) =>
              `<div class="win"><b>${escapeHtml(win.title)}</b><span>${escapeHtml(win.detail)}</span></div>`,
          )
          .join('')}
      </section>
      <section>
        <h2>Skills</h2>
        ${profile.skillGroups
          .map(
            (group) =>
              `<div class="group"><b>${escapeHtml(group.name)}</b><div class="tags">${group.skills
                .map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`)
                .join('')}</div></div>`,
          )
          .join('')}
      </section>
      <section>
        <h2>Education</h2>
        ${profile.education
          .map(
            (item) =>
              `<div class="line"><b>${escapeHtml(item.award)}</b><span>${escapeHtml(item.school)}</span></div>`,
          )
          .join('')}
      </section>
      <section>
        <h2>Certifications</h2>
        ${profile.certifications.map((item) => `<div class="line"><b>${escapeHtml(item)}</b></div>`).join('')}
      </section>
    </div>
  </div>
</body></html>`
