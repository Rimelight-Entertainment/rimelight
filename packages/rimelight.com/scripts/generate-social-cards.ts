import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs"
import { join, relative, dirname, parse } from "path"
import "dotenv/config"

const BASE_URL = process.env.BASE_URL || "https://rimelight.com"
const CF_API = "https://api.cloudflare.com/client/v4/accounts"
const CONTENT_ROOT = "src/content"
const CONTENT_DIRS = readdirSync(CONTENT_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => join(CONTENT_ROOT, d.name))
const OUTPUT_DIR = "public/social-cards"

interface Post {
  id: string
  locale: string
  type: string
  slug: string
  title: string
  description: string
  pubDate: string
  collection: string
}

function parseFrontmatter(filePath: string): Record<string, string> {
  const raw = readFileSync(filePath, "utf-8")
  const rawMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  if (!rawMatch) return {}

  const frontmatter = rawMatch[1]!
  const fields: Record<string, string> = {}

  for (const line of frontmatter.split("\n")) {
    const sep = line.indexOf(":")
    if (sep === -1) continue
    const key = line.slice(0, sep).trim()
    if (!key || !/^\w+$/.test(key)) continue
    let value = line.slice(sep + 1).trim()
    if (value.startsWith('"')) {
      const close = value.indexOf('"', 1)
      if (close !== -1) value = value.slice(1, close)
    } else {
      const hash = value.indexOf(" #")
      if (hash !== -1) value = value.slice(0, hash)
    }
    fields[key] = value.trim()
  }

  return fields
}

function walkDir(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walkDir(full))
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full)
    }
  }
  return files
}

function readPosts(): Post[] {
  const files: string[] = []
  for (const dir of CONTENT_DIRS) {
    files.push(...walkDir(dir))
  }

  return files
    .map((file) => {
      const normalizedPath = file.replace(/\\/g, "/")
      const contentDir = CONTENT_DIRS.find((d) => normalizedPath.startsWith(d.replace(/\\/g, "/")))
      if (!contentDir) return null
      const collection = contentDir.replace(/\\/g, "/").split("/").pop() || ""

      const relativePath = relative(contentDir, file)
      const parts = relativePath.split("/")

      if (parts.length < 2) return null

      const locale = parts[0]!
      const type = parts.slice(1, -1).join("/")
      const slug = parse(parts[parts.length - 1]!).name
      const id = `${locale}/${type}/${slug}`

      const fm = parseFrontmatter(file)
      const title = fm["title"] || slug
      const description = fm["description"] || ""
      const pubDate = fm["pubDate"] || ""

      return { id, locale, type, slug, title, description, pubDate, collection }
    })
    .filter((p): p is Post => p !== null)
}

async function captureScreenshot(
  accountId: string,
  apiToken: string,
  pageUrl: string
): Promise<ArrayBuffer> {
  const endpoint = `${CF_API}/${accountId}/browser-rendering/screenshot`

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: pageUrl,
      viewport: { width: 1200, height: 630 },
      gotoOptions: { waitUntil: "networkidle0" }
    })
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Screenshot API returned ${res.status}: ${text}`)
  }

  return res.arrayBuffer()
}

async function main() {
  const accountId = process.env.CF_ACCOUNT_ID
  const apiToken = process.env.CF_API_TOKEN

  if (!accountId || !apiToken) {
    console.log("Skipping OG generation: CF_ACCOUNT_ID and CF_API_TOKEN not set")
    return
  }

  const force = process.argv.includes("--force")
  const posts = readPosts()

  if (posts.length === 0) {
    console.log("No posts found.")
    return
  }

  console.log(`Found ${posts.length} posts\n`)

  mkdirSync(OUTPUT_DIR, { recursive: true })

  let generated = 0
  let skipped = 0

  await posts.reduce(async (promise, post, index) => {
    await promise

    const outPath = join(OUTPUT_DIR, `${post.id}.png`)
    const label = `[${index + 1}/${posts.length}]`

    if (!force && existsSync(outPath)) {
      console.log(`${label} ${post.id}.png — skipped (exists)`)
      skipped++
      return
    }

    const params = new URLSearchParams({
      title: post.title,
      description: post.description,
      date: post.pubDate,
      locale: post.locale
    })
    const url = `${BASE_URL}/${post.locale}/og/${post.collection}-og?${params}`

    try {
      const png = await captureScreenshot(accountId, apiToken, url)
      mkdirSync(dirname(outPath), { recursive: true })
      writeFileSync(outPath, Buffer.from(png))
      console.log(`${label} ${post.id}.png — done`)
      generated++
    } catch (err) {
      console.error(`${label} ${post.id}.png — failed:`, err)
    }

    await new Promise((resolve) => setTimeout(resolve, 200))
  }, Promise.resolve())

  console.log(`\nDone. Generated: ${generated}, Skipped: ${skipped}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
