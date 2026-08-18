import { db } from "../db/index.ts"
import { pages } from "../db/schema/index.ts"
import { eq, and, isNull } from "drizzle-orm"

async function debugDb() {
  console.log("=== Debugging Database State ===")

  try {
    // Get all doc pages
    const allDocPages = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, "doc"), isNull(pages.deletedAt)))

    console.log(`Found ${allDocPages.length} doc pages in database`)

    for (const page of allDocPages) {
      console.log(`- Slug: ${page.slug}`)
      console.log(`  Title: ${JSON.stringify(page.title)}`)
      console.log(`  Type: ${page.type}`)
      console.log(`  Content type: ${typeof page.content}`)
      console.log(`  Has blocks: ${page.content?.blocks ? "Yes" : "No"}`)
      console.log(`  Properties: ${JSON.stringify(page.content?.properties)}`)
      console.log("---")
    }

    // Try to find index page
    const indexPages = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, "doc"), eq(pages.slug, "index"), isNull(pages.deletedAt)))

    console.log(`\n=== Index Page Query ===`)
    console.log(`Found ${indexPages.length} index pages`)

    const versionIndexPages = await db
      .select()
      .from(pages)
      .where(and(eq(pages.type, "doc"), eq(pages.slug, "v2.0.0/index"), isNull(pages.deletedAt)))

    console.log(`\n=== Version Index Page Query ===`)
    console.log(`Found ${versionIndexPages.length} v2.0.0/index pages`)
  } catch (error) {
    console.error("Database error:", error)
  }
}

debugDb()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
