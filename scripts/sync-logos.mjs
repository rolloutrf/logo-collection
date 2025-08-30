#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { promises as fsp } from 'node:fs'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const REPO = 'rolloutrf/logos'
const GIT_URL = `https://github.com/${REPO}.git`
const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const DEST_DIR = path.join(PROJECT_ROOT, 'src', 'logos')

function log(msg) {
  process.stdout.write(`[sync-logos] ${msg}\n`)
}

async function ensureEmptyDir(dir) {
  await fsp.rm(dir, { recursive: true, force: true })
  await fsp.mkdir(dir, { recursive: true })
}

async function copySvgs(srcRoot, destRoot) {
  let count = 0
  async function walk(curr) {
    const entries = await fsp.readdir(curr, { withFileTypes: true })
    for (const e of entries) {
      const full = path.join(curr, e.name)
      if (e.isDirectory()) {
        await walk(full)
      } else if (e.isFile() && e.name.toLowerCase().endsWith('.svg')) {
        const rel = path.relative(srcRoot, full)
        const out = path.join(destRoot, rel)
        await fsp.mkdir(path.dirname(out), { recursive: true })
        await fsp.copyFile(full, out)
        count++
      }
    }
  }
  await walk(srcRoot)
  return count
}

async function main() {
  const tmpBase = await fsp.mkdtemp(path.join(os.tmpdir(), 'logos-'))
  const tmpRepo = path.join(tmpBase, 'repo')
  log(`Working in ${tmpBase}`)

  // Try git first
  const gitCheck = spawnSync('git', ['--version'], { stdio: 'ignore' })
  let cloned = false
  if (gitCheck.status === 0) {
    log(`Cloning via git: ${GIT_URL}`)
    const r = spawnSync('git', ['clone', '--depth', '1', GIT_URL, tmpRepo], { stdio: 'inherit' })
    cloned = r.status === 0
  }

  // Fallback: npx degit
  if (!cloned) {
    log('Falling back to npx degit')
    const r = spawnSync('npx', ['-y', 'degit', REPO, tmpRepo], { stdio: 'inherit' })
    if (r.status !== 0) {
      throw new Error('Failed to fetch repository via git or degit')
    }
  }

  await ensureEmptyDir(DEST_DIR)
  const count = await copySvgs(tmpRepo, DEST_DIR)
  log(`Copied ${count} SVG files to ${path.relative(PROJECT_ROOT, DEST_DIR)}`)

  // Clean temp
  await fsp.rm(tmpBase, { recursive: true, force: true })
}

main().catch((err) => {
  console.error('[sync-logos] Error:', err?.message || err)
  process.exit(1)
})

