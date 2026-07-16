import { Hono } from "hono"
import { db } from "@/db"
import { searchIndex, searchIndexFts, rateLimit, images } from "@/db/schema"
import { sql, desc, asc, eq, or, like } from "drizzle-orm"
import { waitUntil } from "cloudflare:workers"
import { auth } from "@/auth/auth"
import { doSearchSync } from "@/lib/searchSync"

const api = new Hono<{ Bindings: ENV }>()

// 1. Better-Auth Handler
api.on(["GET", "POST"], "/auth/*", async (c) => {
  return auth.handler(c.req.raw)
})

// 2. Search API
api.get("/search", async (c) => {
  const q = c.req.query("q") || ""
  const currentBuildTime = import.meta.env.BUILD_TIME

  if (currentBuildTime) {
    waitUntil(
      (async () => {
        try {
          const [lastSync] = await db
            .select()
            .from(rateLimit)
            .where(eq(rateLimit.key, "search_sync_build_time"))
            .limit(1)

          if (!lastSync || lastSync.lastRequest !== Date.parse(currentBuildTime)) {
            console.log("[Search API] Build time mismatch. Syncing search index in background...")

            await doSearchSync()

            if (lastSync) {
              await db
                .update(rateLimit)
                .set({ lastRequest: Date.parse(currentBuildTime) })
                .where(eq(rateLimit.key, "search_sync_build_time"))
            } else {
              await db.insert(rateLimit).values({
                key: "search_sync_build_time",
                count: 0,
                lastRequest: Date.parse(currentBuildTime)
              })
            }
          }
        } catch (err) {
          console.error("[Search API] Background sync check failed:", err)
        }
      })()
    )
  }

  if (!q.trim()) {
    return c.json([])
  }

  try {
    const cleanQuery = q.trim().replace(/[!|&()*"]/g, "")
    const ftsQuery = cleanQuery
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}*`)
      .join(" AND ")

    console.log("[Search API] Query:", q, "Cleaned:", cleanQuery, "FTS Query:", ftsQuery)

    let results = []
    try {
      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`search_index_fts.rank`,
          snippet: sql<string>`highlight(search_index_fts, 1, '<mark>', '</mark>')`
        })
        .from(searchIndex)
        .innerJoin(searchIndexFts, eq(searchIndex.id, searchIndexFts.rowid))
        .where(sql`search_index_fts MATCH ${ftsQuery}`)
        .orderBy(asc(sql`search_index_fts.rank`), desc(searchIndex.updatedAt))
        .limit(10)
    } catch (dbErr: any) {
      console.warn("[Search API] FTS query failed, falling back to LIKE search:", dbErr.message)
      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`1`,
          snippet: sql<string>`substr(${searchIndex.bodyContent}, 1, 150)`
        })
        .from(searchIndex)
        .where(or(like(searchIndex.title, `%${q}%`), like(searchIndex.bodyContent, `%${q}%`)))
        .orderBy(desc(searchIndex.updatedAt))
        .limit(10)
    }

    return c.json(results)
  } catch (error: any) {
    console.error("[Search API Global Error]:", error)
    return c.json({ error: error.message }, 500)
  }
})

// 3. Sync Search API
api.get("/syncSearch", async (c) => {
  const token = c.req.query("token")
  const syncToken = import.meta.env.SYNC_TOKEN ?? process.env.SYNC_TOKEN

  if (import.meta.env.PROD && (!syncToken || token !== syncToken)) {
    return c.json({ error: "Unauthorized" }, 401)
  }

  try {
    const result = await doSearchSync()
    return c.json({ success: true, ...result })
  } catch (error: any) {
    console.error("[Search Sync API Global Error]:", error)
    return c.json({ error: error.message }, 500)
  }
})

// 4. Assets API
api.get("/assets/:key{.*}", async (c) => {
  const key = c.req.param("key")
  if (!key) {
    return c.text("Missing asset key", 400)
  }

  const bucket = c.env?.BLOB ?? globalThis.BLOB
  if (!bucket) {
    return c.text("R2 binding not available", 500)
  }

  try {
    const object = await bucket.get(key)
    if (!object) {
      return c.text("Asset not found", 404)
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream")
    headers.set("Cache-Control", "public, max-age=31536000")

    return new Response(object.body, { headers })
  } catch (err: any) {
    return c.text(err.message || "Internal error", 500)
  }
})

// 5. Chat API (WebSocket)
api.get("/chat/:id", async (c) => {
  const id = c.req.param("id")
  if (!id) {
    return c.text("Missing room id", 400)
  }

  const upgradeHeader = c.req.header("Upgrade")
  if (upgradeHeader?.toLowerCase() !== "websocket") {
    return c.text("Expected WebSocket upgrade", 426)
  }

  const chatRoomNamespace = c.env?.ChatRoom ?? globalThis.ChatRoom
  if (!chatRoomNamespace) {
    return c.text("ChatRoom Durable Object namespace not bound", 500)
  }

  const chatRoomId = chatRoomNamespace.idFromName(id)
  const chatRoomStub = chatRoomNamespace.get(chatRoomId)

  return chatRoomStub.fetch(c.req.raw)
})

// 6. Upload API
api.post("/upload", async (c) => {
  const bucket = c.env?.BLOB ?? globalThis.BLOB
  if (!bucket) {
    return c.json({ error: "R2 binding not available" }, 500)
  }

  try {
    const formData = await c.req.formData()
    const file = formData.get("file")
    if (!file || typeof file === "string") {
      return c.json({ error: "No file provided" }, 400)
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 10)
    const ext = file.name.split(".").pop() || "webp"
    const key = `blog/${timestamp}-${random}.${ext}`

    const buffer = await file.arrayBuffer()
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: file.type || "image/webp" }
    })

    const fileUrl = `/api/assets/${key}`

    await db.insert(images).values({
      filename: file.name,
      url: fileUrl,
      size: file.size,
      mimeType: file.type || "image/webp"
    })

    return c.json({ url: fileUrl })
  } catch (err: any) {
    return c.json({ error: err.message || "Upload failed" }, 500)
  }
})

export default api
