/**
 * Loads the production build in a real browser and adds up what it actually
 * downloads, then compares that against the budget in PLAN.md. A manifest can
 * only guess at this; the browser knows.
 */
import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import {
  checkBudget,
  emptyMeasurement,
  formatKb,
  isOverBudget,
  type Measured,
  type ResourceKind,
} from '../src/lib/budget'

const PORT = Number(process.env.SIZE_CHECK_PORT ?? 3014)
const ORIGIN = `http://127.0.0.1:${PORT}`
const REPORT = 'evidence/size-report.json'

const KINDS: readonly ResourceKind[] = [
  'document',
  'script',
  'stylesheet',
  'image',
  'font',
  'other',
]

const asKind = (resourceType: string): ResourceKind =>
  (KINDS as readonly string[]).includes(resourceType) ? (resourceType as ResourceKind) : 'other'

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The server is not listening yet. Keep waiting until the deadline.
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`${url} never answered within ${timeoutMs}ms`)
}

type Resource = { url: string; kind: ResourceKind; bytes: number }

async function measure(url: string): Promise<{ measured: Measured; resources: Resource[] }> {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const measured = emptyMeasurement()
  const resources: Resource[] = []
  const pending: Promise<void>[] = []

  page.on('response', (response) => {
    pending.push(
      (async () => {
        const kind = asKind(response.request().resourceType())
        const { responseBodySize, responseHeadersSize } = await response.request().sizes()
        const bytes = responseBodySize + responseHeadersSize
        measured[kind] += bytes
        measured.total += bytes
        resources.push({ url: new URL(response.url()).pathname, kind, bytes })
      })(),
    )
  })

  await page.goto(url, { waitUntil: 'networkidle' })
  await Promise.all(pending)
  await browser.close()
  resources.sort((a, b) => b.bytes - a.bytes)
  return { measured, resources }
}

async function main(): Promise<void> {
  // detached so the kill below reaches next itself, not just the pnpm wrapper
  const server = spawn('pnpm', ['start', '--port', String(PORT)], {
    stdio: 'ignore',
    detached: true,
  })
  try {
    await waitForServer(ORIGIN, 60_000)
    const { measured, resources } = await measure(ORIGIN)
    const rows = checkBudget(measured)

    for (const kind of KINDS) {
      console.log(`  ${kind.padEnd(12)} ${formatKb(measured[kind])}`)
    }
    console.log('')
    for (const row of rows) {
      const verdict = row.over ? 'OVER' : 'ok'
      console.log(
        `  ${row.name.padEnd(16)} ${formatKb(row.measured).padStart(10)} / ${formatKb(row.limit).padStart(10)}  ${verdict}`,
      )
    }

    console.log('\n  biggest resources')
    for (const resource of resources.slice(0, 8)) {
      console.log(
        `    ${formatKb(resource.bytes).padStart(10)}  ${resource.kind.padEnd(11)} ${resource.url}`,
      )
    }

    await mkdir('evidence', { recursive: true })
    await writeFile(REPORT, `${JSON.stringify({ measured, rows, resources }, null, 2)}\n`)
    console.log(`\n  report written to ${REPORT}`)

    if (isOverBudget(rows)) {
      throw new Error('the first load of / is over budget, see the table above')
    }
  } finally {
    if (server.pid) process.kill(-server.pid, 'SIGTERM')
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
