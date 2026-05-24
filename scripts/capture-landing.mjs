import { chromium } from "playwright"
import { mkdir } from "fs/promises"

const base = process.env.PREVIEW_URL || "http://localhost:3000"
const outDir = "/workspace/artifacts/screenshots"

await mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})

await page.goto(base, { waitUntil: "load", timeout: 60000 })
await page.waitForTimeout(4000)

await page.screenshot({ path: `${outDir}/00-full-page-desktop.png`, fullPage: true })
console.log("desktop full")

const names = [
  "01-hero",
  "02-trust-strip",
  "03-features",
  "04-how-it-works",
  "05-dashboard-preview",
  "06-testimonials",
  "07-pricing",
  "08-cta",
]
const sections = page.locator("section")
const count = await sections.count()
for (let i = 0; i < Math.min(count, names.length); i++) {
  await sections.nth(i).scrollIntoViewIfNeeded()
  await page.waitForTimeout(300)
  await sections.nth(i).screenshot({ path: `${outDir}/${names[i]}.png` })
  console.log("OK", names[i])
}

await page.locator("footer").screenshot({ path: `${outDir}/09-footer.png` })

await page.setViewportSize({ width: 390, height: 844 })
await page.waitForTimeout(500)
await page.screenshot({ path: `${outDir}/10-mobile-full.png`, fullPage: true })
await sections.nth(0).screenshot({ path: `${outDir}/11-mobile-hero.png` })
console.log("mobile done")

await browser.close()
