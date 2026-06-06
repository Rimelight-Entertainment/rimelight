import type { APIRoute } from "astro"
import { db } from "@/db"
import { searchIndex, searchIndexFts } from "@/db/schema"
import { sql, desc, asc, eq, or, like } from "drizzle-orm"

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const q = url.searchParams.get("q") || ""

  if (!q.trim()) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  }

  try {
    const cleanQuery = q.trim().replace(/[!|&()*"]/g, "")

    console.log("[Search API] Query:", q, "Cleaned:", cleanQuery)

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
        .where(sql`search_index_fts MATCH ${cleanQuery}`)
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
