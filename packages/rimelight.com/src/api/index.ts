import { Hono } from "hono"
import { getFetchState } from "astro/hono"
import { db } from "@/db"
import { pages, pageVersions, searchIndex } from "@/db/schema"
import { sql, desc, or, like, eq, and, isNull, isNotNull, inArray, asc } from "drizzle-orm"
import type { PageType } from "@/types/pages"
import { auth } from "@/auth/auth"

const isPageType = (_t: string): _t is PageType => true

interface CloudflareEnv {
  BLOB: R2Bucket
  R2: R2Bucket
}

const api = new Hono()

// Helper to get Cloudflare bindings
function isCloudflareEnv(env: unknown): env is CloudflareEnv {
  return typeof env === "object" && env !== null && "BLOB" in env && "R2" in env
}

const getCloudflareEnv = (c: any): CloudflareEnv | undefined => {
  const state = getFetchState(c)
  const runtime = Reflect.get(state.locals, "runtime")
  const env = runtime && typeof runtime === "object" ? Reflect.get(runtime, "env") : c.env
  if (isCloudflareEnv(env)) return env
  return undefined
}

// 1. Better-Auth Handler
api.on(["GET", "POST"], "/auth/*", async (c) => {
  return auth.handler(c.req.raw)
})

// 2. Search API (PostgreSQL Full Text Search)
api.get("/search", async (c) => {
  const q = c.req.query("q") || ""

  if (!q.trim()) {
    return c.json([])
  }

  try {
    const cleanQuery = q.trim().replace(/[!|&()*]/g, "")
    const terms = cleanQuery.split(/\s+/).filter(Boolean)
    const formattedQuery = terms.map((t) => `${t}:*`).join(" & ")

    console.log("[Search API] Query:", q, "Formatted:", formattedQuery)

    let results = []
    try {
      const querySql = formattedQuery
        ? sql`to_tsquery('english', ${formattedQuery})`
        : sql`websearch_to_tsquery('english', ${q})`

      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`ts_rank(${searchIndex.searchableText}, ${querySql})`,
          snippet: sql<string>`ts_headline('english', ${searchIndex.bodyContent}, ${querySql}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=20')`
        })
        .from(searchIndex)
        .where(
          sql`${searchIndex.searchableText} @@ ${querySql} or ${searchIndex.title} ilike ${`%${q}%`}`
        )
        .orderBy(
          desc(sql`ts_rank(${searchIndex.searchableText}, ${querySql})`),
          desc(searchIndex.updatedAt)
        )
        .limit(10)
    } catch (dbErr: any) {
      console.warn("[Search API] FTS query failed, falling back to ILIKE search:", dbErr.message)
      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`1`,
          snippet: sql<string>`substring(${searchIndex.bodyContent} from 1 for 150)`
        })
        .from(searchIndex)
        .where(or(like(searchIndex.title, `%${q}%`), like(searchIndex.bodyContent, `%${q}%`)))
        .orderBy(desc(searchIndex.updatedAt))
        .limit(10)
    }

    console.log("[Search API] Found results:", results.length)
    return c.json(results)
  } catch (error: any) {
    console.error("[Search API Global Error]:", error)
    return c.json({ error: error.message }, 500)
  }
})

// 3. GitHub Changelog API
api.get("/github/changelog", async (c) => {
  const component = c.req.query("component")
  if (!component) {
    return c.json({ error: "Component name is required" }, 400)
  }

  const pascalName = component
    .split("-")
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1))
    .join("")

  const token = import.meta.env.GITHUB_TOKEN || process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    "User-Agent": "Rimelight-Docs-Changelog",
    "Accept": "application/vnd.github.v3+json"
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const paths = [
    `packages/ui/src/components/${component}/RLV${pascalName}.vue`,
    `packages/ui/src/components/${component}/RLA${pascalName}.astro`,
    `packages/ui/src/components/${component}/${component}.theme.ts`
  ]

  try {
    const allCommitsPromises = paths.map(async (p) => {
      const apiUrl = `https://api.github.com/repos/Rimelight-Entertainment/rimelight/commits?path=${encodeURIComponent(p)}&per_page=50`
      const res = await fetch(apiUrl, { headers })
      if (!res.ok) return []
      const data = await res.json()
      if (!Array.isArray(data)) return []
      return data.map((commit: any) => ({
        sha: commit.sha,
        date: commit.commit.author?.date || commit.commit.committer?.date || "",
        message: commit.commit.message.split("\n")[0] || ""
      }))
    })

    const commitsLists = await Promise.all(allCommitsPromises)
    const uniqueCommits = new Map<string, { sha: string; date: string; message: string }>()
    for (const list of commitsLists) {
      for (const commit of list) {
        if (!uniqueCommits.has(commit.sha)) {
          uniqueCommits.set(commit.sha, commit)
        }
      }
    }
    const commits = Array.from(uniqueCommits.values()).toSorted(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    if (commits.length === 0) {
      return c.json([])
    }

    const releasesRes = await fetch(
      "https://api.github.com/repos/Rimelight-Entertainment/rimelight/releases?per_page=50",
      { headers }
    )
    let releases = []
    if (releasesRes.ok) {
      const data = await releasesRes.json()
      if (Array.isArray(data)) {
        releases = data.filter((r: any) => r.published_at)
      }
    }

    const sortedReleases = [...releases].toSorted(
      (a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    )
    const releasesOldestFirst = [...sortedReleases].toReversed()

    const groups: any[] = []
    const unreleased: any[] = []

    for (const commit of commits) {
      const commitTime = new Date(commit.date).getTime()
      const release = releasesOldestFirst.find(
        (r: any) => new Date(r.published_at).getTime() >= commitTime
      )

      if (release) {
        let group = groups.find((g) => g.tag === release.tag_name)
        if (!group) {
          group = {
            tag: release.tag_name,
            title: release.name || release.tag_name,
            published_at: release.published_at,
            url: release.html_url,
            commits: []
          }
          groups.push(group)
        }
        group.commits.push(commit)
      } else {
        unreleased.push(commit)
      }
    }

    const result: any[] = []
    if (unreleased.length > 0) {
      result.push({
        tag: "unreleased",
        title: "Soon",
        commits: unreleased
      })
    }

    groups.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    result.push(...groups)

    c.header("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=600")
    return c.json(result)
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

// 4. Assets API (GET)
api.get("/assets/:key{.*}", async (c) => {
  const state = getFetchState(c)
  const user = state.locals.user
  if (!user) {
    return c.text("Unauthorized", 401)
  }

  const key = c.req.param("key")
  if (!key) {
    return c.text("Bad Request", 400)
  }

  const env = getCloudflareEnv(c)
  const BLOB = env?.BLOB
  if (!BLOB) {
    console.warn("[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for GET.")
    return c.text("R2 not bound in local environment", 503)
  }

  const obj = await BLOB.get(key)
  if (!obj) {
    return c.text("Not Found", 404)
  }

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream"
    }
  })
})

// 5. Assets API (PUT)
api.put("/assets/:key{.*}", async (c) => {
  const state = getFetchState(c)
  const user = state.locals.user
  if (!user) {
    return c.text("Unauthorized", 401)
  }

  const key = c.req.param("key")
  if (!key) {
    return c.text("Bad Request", 400)
  }

  const env = getCloudflareEnv(c)
  const BLOB = env?.BLOB
  if (!BLOB) {
    console.warn(
      "[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for PUT. Simulating success locally."
    )
    return c.json({ success: true, localMock: true })
  }

  const contentType = c.req.header("content-type") || "application/octet-stream"
  const body = await c.req.arrayBuffer()

  await BLOB.put(key, body, {
    httpMetadata: { contentType }
  })

  return c.json({ success: true })
})

// 6. Assets API (DELETE)
api.delete("/assets/:key{.*}", async (c) => {
  const state = getFetchState(c)
  const user = state.locals.user
  if (!user) {
    return c.text("Unauthorized", 401)
  }

  const key = c.req.param("key")
  if (!key) {
    return c.text("Bad Request", 400)
  }

  const env = getCloudflareEnv(c)
  const BLOB = env?.BLOB
  if (!BLOB) {
    console.warn(
      "[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for DELETE. Simulating success locally."
    )
    return c.json({ success: true, localMock: true })
  }

  await BLOB.delete(key)

  return c.json({ success: true })
})

// 7. Assets API (POST) - Move/Rename
api.post("/assets/:key{.*}", async (c) => {
  const state = getFetchState(c)
  const user = state.locals.user
  if (!user) {
    return c.text("Unauthorized", 401)
  }

  const key = c.req.param("key")
  if (!key) {
    return c.text("Bad Request", 400)
  }

  const env = getCloudflareEnv(c)
  const BLOB = env?.BLOB
  if (!BLOB) {
    console.warn(
      "[R2 Assets] Cloudflare R2 bucket (BLOB) not bound for POST. Simulating success locally."
    )
    return c.json({ success: true, localMock: true })
  }

  const body: Record<string, unknown> = await c.req.json()
  const newKey = body.to
  if (typeof newKey !== "string") {
    return c.text("Missing or invalid target key ('to')", 400)
  }

  const obj = await BLOB.get(key)
  if (!obj) {
    return c.text("Source object not found", 404)
  }
  if (!obj.body) {
    return c.text("Source object has no body", 500)
  }

  await BLOB.put(newKey, obj.body, {
    httpMetadata: {
      contentType: obj.httpMetadata?.contentType || "application/octet-stream"
    }
  })

  await BLOB.delete(key)

  return c.json({ success: true })
})

// 8. Pages API (GET /pages)
api.get("/pages", async (c) => {
  try {
    const type = c.req.query("type")
    const statusInput = c.req.query("status")
    const status = statusInput === "published" || statusInput === "draft" ? statusInput : undefined
    const limitVal = Math.max(1, parseInt(c.req.query("limit") || "50") || 50)
    const offsetVal = Math.max(0, parseInt(c.req.query("offset") || "0") || 0)
    const orderByVal = c.req.query("orderBy") || "postedAt"
    const orderVal = c.req.query("order") || "desc"

    const conditions = [isNull(pages.deletedAt)]

    if (type) {
      conditions.push(sql`LOWER(${pages.type}) = LOWER(${type})`)
    }

    if (status === "published") {
      conditions.push(isNotNull(pages.postedAt))
    } else if (status === "draft") {
      conditions.push(isNull(pages.postedAt))
    }

    const orderFn = orderVal === "asc" ? asc : desc
    const orderColumn =
      orderByVal === "title"
        ? pages.title
        : orderByVal === "createdAt"
          ? pages.createdAt
          : pages.postedAt

    const results = await db
      .select()
      .from(pages)
      .where(and(...conditions))
      .orderBy(orderFn(orderColumn))
      .limit(limitVal)
      .offset(offsetVal)

    return c.json(
      results.map((row) =>
        Object.assign(row, {
          blocks: row.content?.blocks || [],
          properties: row.content?.properties || {}
        })
      )
    )
  } catch (err: any) {
    console.error("[Pages API GET Error]:", err)
    return c.json({ error: err.message }, 500)
  }
})

// 9. Pages API (GET /pages/list)
api.get("/pages/list", async (c) => {
  try {
    const typesParam = c.req.query("types")
    const prefix = c.req.query("prefix")

    const conditions = [isNull(pages.deletedAt)]

    if (prefix) {
      conditions.push(like(pages.slug, `${prefix}%`))
    }

    if (typesParam) {
      const typesList = typesParam.split(",").filter(Boolean)
      if (typesList.length > 0) {
        conditions.push(inArray(pages.type, typesList.filter(isPageType)))
      }
    }

    const results = await db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        type: pages.type
      })
      .from(pages)
      .where(and(...conditions))
      .orderBy(asc(pages.slug))

    return c.json(results)
  } catch (err: any) {
    console.error("[Pages List API Error]:", err)
    return c.json({ error: err.message }, 500)
  }
})

// 10. Pages API (GET /pages/id/:id)
api.get("/pages/id/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const [row] = await db
      .select()
      .from(pages)
      .where(and(eq(pages.id, id), isNull(pages.deletedAt)))
      .limit(1)

    if (!row) {
      return c.json({ error: "Page not found" }, 404)
    }

    return c.json({
      ...row,
      blocks: row.content?.blocks || [],
      properties: row.content?.properties || {}
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// 11. Pages API (GET /pages/find/*)
api.get("/pages/find/:slug{.*}", async (c) => {
  try {
    const rawSlug = c.req.param("slug") || ""
    const cleanSlug = rawSlug.replace(/^\/|\/$/g, "")

    const [row] = await db
      .select()
      .from(pages)
      .where(
        and(or(eq(pages.slug, cleanSlug), eq(pages.slug, `/${cleanSlug}`)), isNull(pages.deletedAt))
      )
      .limit(1)

    if (!row) {
      return c.json({ error: "Page not found" }, 404)
    }

    return c.json({
      ...row,
      blocks: row.content?.blocks || [],
      properties: row.content?.properties || {}
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// 12. Pages API (PUT /pages/id/:id)
api.put("/pages/id/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const body = await c.req.json()
    const { title, description, tags, blocks, properties, type, slug } = body

    await db
      .update(pages)
      .set({
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(tags ? { tags } : {}),
        ...(slug ? { slug } : {}),
        ...(type ? { type } : {}),
        content: {
          blocks: blocks || [],
          properties: properties || {}
        },
        updatedAt: new Date()
      })
      .where(eq(pages.id, id))

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// 13. Pages API (POST /pages/id/:id/publish & unpublish & DELETE)
api.post("/pages/id/:id/publish", async (c) => {
  try {
    const id = c.req.param("id")
    await db
      .update(pages)
      .set({ postedAt: new Date(), updatedAt: new Date() })
      .where(eq(pages.id, id))
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.post("/pages/id/:id/unpublish", async (c) => {
  try {
    const id = c.req.param("id")
    await db.update(pages).set({ postedAt: null, updatedAt: new Date() }).where(eq(pages.id, id))
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.delete("/pages/id/:id", async (c) => {
  try {
    const id = c.req.param("id")
    await db.update(pages).set({ deletedAt: new Date() }).where(eq(pages.id, id))
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// 14. Pages API (POST /pages)
api.post("/pages", async (c) => {
  try {
    const body = await c.req.json()
    const { title, slug, type, description, blocks, properties } = body

    const [newPage] = await db
      .insert(pages)
      .values({
        title: title || { en: "Untitled Page" },
        slug: slug || `page-${Date.now()}`,
        type: type || "Default",
        description: description || { en: "" },
        content: {
          blocks: blocks || [],
          properties: properties || {}
        }
      })
      .returning()

    return c.json(newPage)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// 15. Pages Versioning API
api.get("/pages/versions/page/:pageId", async (c) => {
  try {
    const pageId = c.req.param("pageId")
    const versions = await db
      .select()
      .from(pageVersions)
      .where(and(eq(pageVersions.pageId, pageId), isNull(pageVersions.deletedAt)))
      .orderBy(desc(pageVersions.createdAt))
    return c.json(versions)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.get("/pages/versions/:id", async (c) => {
  try {
    const id = c.req.param("id")
    const [version] = await db
      .select()
      .from(pageVersions)
      .where(and(eq(pageVersions.id, id), isNull(pageVersions.deletedAt)))
      .limit(1)

    if (!version) return c.json({ error: "Version not found" }, 404)
    return c.json(version)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.post("/pages/versions/:id/approve", async (c) => {
  try {
    const id = c.req.param("id")
    const [version] = await db.select().from(pageVersions).where(eq(pageVersions.id, id)).limit(1)

    if (!version) return c.json({ error: "Version not found" }, 404)

    await db
      .update(pageVersions)
      .set({ status: "approved", approvedAt: new Date() })
      .where(eq(pageVersions.id, id))

    await db
      .update(pages)
      .set({
        title: version.title,
        description: version.description,
        slug: version.slug,
        type: version.type,
        content: version.content,
        updatedAt: new Date()
      })
      .where(eq(pages.id, version.pageId))

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

api.post("/pages/versions/:id/reject", async (c) => {
  try {
    const id = c.req.param("id")
    await db.update(pageVersions).set({ status: "rejected" }).where(eq(pageVersions.id, id))
    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

export default api
