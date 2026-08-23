import { extractTextFromBlocks } from "../core/excerpt"
import { contentSearchIndex } from "../schema/search"
import { eq, and, sql } from "drizzle-orm"

export async function indexPageForSearch(
  db: any,
  page: {
    id: string
    title: any
    content: any
  },
  locales: string[] = ["en", "pt"]
) {
  if (!db) return

  const parseJson = (val: any) => (typeof val === "string" ? JSON.parse(val) : val)
  const titleObj = parseJson(page.title) || {}
  const contentObj = parseJson(page.content) || {}
  const blocks = contentObj.blocks || []

  for (const locale of locales) {
    const titleText =
      typeof titleObj === "object" && titleObj !== null
        ? titleObj[locale] || titleObj.en || Object.values(titleObj)[0] || ""
        : String(titleObj || "")

    const contentText = extractTextFromBlocks(blocks, locale)

    if (!titleText && !contentText) continue

    // Upsert search index record
    try {
      const existing = await db
        .select()
        .from(contentSearchIndex)
        .where(and(eq(contentSearchIndex.pageId, page.id), eq(contentSearchIndex.locale, locale)))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(contentSearchIndex)
          .set({
            titleText,
            contentText,
            searchVector: sql`to_tsvector('english', ${titleText} || ' ' || ${contentText})`
          })
          .where(eq(contentSearchIndex.id, existing[0].id))
      } else {
        await db.insert(contentSearchIndex).values({
          pageId: page.id,
          locale,
          titleText,
          contentText,
          searchVector: sql`to_tsvector('english', ${titleText} || ' ' || ${contentText})`
        })
      }
    } catch (err) {
      console.error(`[Search Indexer] Failed to index page ${page.id} for locale ${locale}:`, err)
    }
  }
}
