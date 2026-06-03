import type { APIRoute } from "astro"
import { db } from "@/db"
import { searchIndex } from "@/db/schema"
import { sql, desc } from "drizzle-orm"

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
    // Format prefix query to support typing partial words (e.g. "depl" matches "deployment")
    const cleanQuery = q.trim().replace(/[!|&()*]/g, "")
    const terms = cleanQuery.split(/\s+/).filter(Boolean)
    const formattedQuery = terms.map(t => `${t}:*`).join(" & ")

    const querySql = formattedQuery
      ? sql`to_tsquery('english', ${formattedQuery})`
      : sql`websearch_to_tsquery('english', ${q})`

    const results = await db
      .select({
        title: searchIndex.title,
        url: searchIndex.url,
        sourceType: searchIndex.sourceType,
        rank: sql<number>`ts_rank(${searchIndex.searchableText}, ${querySql})`,
        snippet: sql<string>`ts_headline('english', ${searchIndex.bodyContent}, ${querySql}, 'StartSel=<mark class="bg-primary-500/30 text-primary-200 px-0.5 rounded">, StopSel=</mark>, MaxWords=20')`
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

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
