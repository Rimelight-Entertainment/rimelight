import type { APIRoute } from "astro"
import { db } from "@/db"
import { searchIndex, searchIndexFts, rateLimit } from "@/db/schema"
import { sql, desc, asc, eq, or, like } from "drizzle-orm"
import { waitUntil } from "cloudflare:workers"
import { doSearchSync } from "./syncSearch"

export const GET: APIRoute = async (context) => {
  const { request } = context
  const url = new URL(request.url)
  const q = url.searchParams.get("q") || ""

  // Check and trigger sync in background on new deployments
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
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const cleanQuery = q.trim().replace(/[!|&()*"]/g, "")
    // Prepare prefix matching query for FTS5 (e.g. "toke" -> "toke*", "fluid typography" -> "fluid* AND typography*")
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
          // SQLite FTS5 highlight(tableName, columnIndex, startTag, endTag)
          // 0 is rowid/title, 1 is bodyContent
          snippet: sql<string>`highlight(search_index_fts, 1, '<mark>', '</mark>')`
        })
        .from(searchIndex)
        .innerJoin(searchIndexFts, eq(searchIndex.id, searchIndexFts.rowid))
        .where(sql`search_index_fts MATCH ${ftsQuery}`)
        .orderBy(asc(sql`search_index_fts.rank`), desc(searchIndex.updatedAt))
        .limit(10)
    } catch (dbErr: any) {
      console.warn("[Search API] FTS query failed, falling back to LIKE search:", dbErr.message)
      // Fallback: simple LIKE search across title and body
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

    console.log("[Search API] Found results:", results.length)

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    console.error("[Search API Global Error]:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
