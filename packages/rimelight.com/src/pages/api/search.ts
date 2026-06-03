import type { APIRoute } from "astro"
import { db } from "@/db"
import { searchIndex } from "@/db/schema"
import { sql, desc, or, like } from "drizzle-orm"

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
    const cleanQuery = q.trim().replace(/[!|&()*]/g, "")
    const terms = cleanQuery.split(/\s+/).filter(Boolean)
    const formattedQuery = terms.map(t => `${t}:*`).join(" & ")

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
      // Fallback: simple ILIKE search across title and body
      results = await db
        .select({
          title: searchIndex.title,
          url: searchIndex.url,
          sourceType: searchIndex.sourceType,
          rank: sql<number>`1`,
          snippet: sql<string>`substring(${searchIndex.bodyContent} from 1 for 150)`
        })
        .from(searchIndex)
        .where(
          or(
            like(searchIndex.title, `%${q}%`),
            like(searchIndex.bodyContent, `%${q}%`)
          )
        )
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
