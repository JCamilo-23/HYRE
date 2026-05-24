#!/usr/bin/env node
/**
 * Removes a corrupted `.next` dev cache before starting Next.js.
 * Prevents ENOENT / Internal Server Error on /interview and other routes.
 */
import fs from "node:fs"
import path from "node:path"

const nextDir = path.join(process.cwd(), ".next")

if (!fs.existsSync(nextDir)) {
  process.exit(0)
}

function removeNext(reason) {
  console.warn(`[hyre] Removing .next: ${reason}`)
  fs.rmSync(nextDir, { recursive: true, force: true })
}

try {
  const buildIdPath = path.join(nextDir, "BUILD_ID")
  if (fs.existsSync(buildIdPath)) {
    const buildId = fs.readFileSync(buildIdPath, "utf8").trim()
    if (!buildId || buildId.length < 8 || buildId.includes("broken")) {
      removeNext("invalid BUILD_ID")
      process.exit(0)
    }
  }

  const interviewManifest = path.join(
    nextDir,
    "server",
    "app",
    "interview",
    "page",
    "app-build-manifest.json",
  )
  const interviewDir = path.dirname(interviewManifest)
  const serverApp = path.join(nextDir, "server", "app")

  if (
    fs.existsSync(interviewDir) &&
    !fs.existsSync(interviewManifest)
  ) {
    removeNext("missing interview page build manifest")
    process.exit(0)
  }

  if (fs.existsSync(serverApp)) {
    const vendorChunk = path.join(nextDir, "server", "vendor-chunks", "next.js")
    const vendorDir = path.join(nextDir, "server", "vendor-chunks")
    if (fs.existsSync(vendorDir) && !fs.existsSync(vendorChunk)) {
      const entries = fs.readdirSync(vendorDir)
      if (entries.length === 0) {
        removeNext("empty vendor-chunks")
      }
    }
  }
} catch (err) {
  removeNext(err instanceof Error ? err.message : "cache check failed")
}
