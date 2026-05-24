#!/usr/bin/env node
/**
 * Starts `next dev` and auto-recovers from corrupted `.next` cache (ENOENT manifests).
 * Fixes recurring Internal Server Error on /interview during local development.
 */
import { execSync, spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(scriptsDir, "..")
const DEV_PORT = Number(process.env.PORT) || 3000
const nextDir = path.join(frontendRoot, ".next")

const CORRUPT_RE =
  /ENOENT.*build-manifest\.json|Cannot find module '\.\/vendor-chunks\/next\.js'/

function cleanNext() {
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true })
    console.warn("[hyre] Removed corrupt .next cache")
  }
}

function runEnsure() {
  spawnSync("node", ["scripts/ensure-dev-next.mjs"], {
    cwd: frontendRoot,
    stdio: "inherit",
  })
}


/** Kill hung/stale Next dev servers blocking the default port (common cause of /interview 500). */
function freeDevPort(port = DEV_PORT) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: "utf8" }).trim()
    if (!pids) return
    for (const pid of pids.split(/\s+/)) {
      if (pid) execSync(`kill -9 ${pid}`, { stdio: "ignore" })
    }
    console.warn(`[hyre] Freed port ${port} (stopped stale node/next process)`)
  } catch {
    /* port already free */
  }
}

let recovering = false
let child = null

function startDev() {
  runEnsure()
  freeDevPort(DEV_PORT)

  child = spawn("npx", ["next", "dev", "--turbopack", "-p", String(DEV_PORT)], {
    cwd: frontendRoot,
    stdio: ["inherit", "pipe", "pipe"],
    env: { ...process.env, PORT: String(DEV_PORT) },
  })

  let tail = ""

  const handleOutput = (chunk, isStderr) => {
    const text = chunk.toString()
    if (isStderr) process.stderr.write(text)
    else process.stdout.write(text)

    tail = (tail + text).slice(-12_000)
    if (!recovering && CORRUPT_RE.test(tail)) {
      scheduleRecovery()
    }
  }

  child.stdout.on("data", (d) => handleOutput(d, false))
  child.stderr.on("data", (d) => handleOutput(d, true))

  child.on("exit", (code, signal) => {
    if (recovering) return
    if (signal === "SIGTERM" || signal === "SIGKILL") return
    process.exit(code ?? 0)
  })
}

function scheduleRecovery() {
  if (recovering || !child) return
  recovering = true

  console.warn(
    "\n[hyre] Corrupt Next.js dev cache detected (ENOENT build-manifest).\n" +
      "[hyre] Stopping dev server, removing .next, and restarting...\n",
  )

  const dying = child
  child = null

  const forceKill = setTimeout(() => {
    try {
      dying.kill("SIGKILL")
    } catch {
      /* already dead */
    }
  }, 2500)

  dying.once("exit", () => {
    clearTimeout(forceKill)
    cleanNext()
    recovering = false
    setTimeout(startDev, 400)
  })

  try {
    dying.kill("SIGTERM")
  } catch {
    cleanNext()
    recovering = false
    startDev()
  }
}

process.chdir(frontendRoot)
startDev()
