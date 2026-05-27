import { describe, it, expect, beforeAll, afterAll } from "vitest"
import { chromium, type Browser, type Page } from "playwright"

describe("Content Security Policy Compliance", () => {
  let browser: Browser
  const baseUrl = "https://csp.rimelight.com" // Update to http://localhost:4321 for local testing

  beforeAll(async () => {
    // Launch headless Chromium
    browser = await chromium.launch({ headless: true })
  })

  afterAll(async () => {
    await browser.close()
  })

  it("should have zero CSP console errors across all component test pages", async () => {
    const context = await browser.newContext()
    const page: Page = await context.newPage()
    const violations: { url: string; message: string }[] = []

    // Listen to browser console events
    page.on("console", (msg) => {
      const text = msg.text()
      if (text.includes("violates") && text.includes("Content Security Policy")) {
        violations.push({ url: page.url(), message: text })
      }
    })

    // Also listen to uncaught runtime script/style exceptions
    page.on("pageerror", (err) => {
      if (err.message.includes("Content Security Policy")) {
        violations.push({ url: page.url(), message: err.message })
      }
    })

    // 1. Visit homepage to fetch all component URLs
    console.log(`Navigating to ${baseUrl} to gather test routes...`)
    await page.goto(baseUrl, { waitUntil: "domcontentloaded" })

    const routes = await page.$$eval('a[href^="/csp-test/"]', (anchors) =>
      anchors.map((a) => a.getAttribute("href"))
    )

    expect(routes.length).toBeGreaterThan(0)
    console.log(`Found ${routes.length} component routes to verify. Starting scan...`)

    // 2. Loop through and test every individual route
    for (const route of routes) {
      const url = `${baseUrl}${route}`

      // Navigate to component preview page
      await page.goto(url, { waitUntil: "domcontentloaded" })

      // Perform a body click to trigger potential dynamic/hydrated JS
      await page.evaluate(() => {
        document.body.click()
      })

      // Let any asynchronous client hydration settle (50ms)
      await page.waitForTimeout(50)
    }

    await context.close()

    // 3. Assert that no CSP violations occurred
    if (violations.length > 0) {
      console.error("\n❌ CSP Violations Found:")
      console.table(violations)
    }

    expect(violations.length).toBe(0)
  }, 60000) // 60 seconds timeout to scan all 140+ pages in a single browser session
})
