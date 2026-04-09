import type { APIRoute } from "astro"
import { cms } from "@/generated/api"
import seedData from "@/cms/seed.data"

export const GET: APIRoute = async () => {
  try {
    const results: Record<string, { created: number; skipped: string[] }> = {}

    for (const [collectionSlug, documents] of Object.entries(seedData)) {
      if (!documents || documents.length === 0) continue

      const cmsCollection = (cms as any)[collectionSlug]
      if (!cmsCollection) {
        console.log(`[seed] Collection "${collectionSlug}" not found in CMS`)
        continue
      }

      results[collectionSlug] = { created: 0, skipped: [] }

      // eslint-disable-next-line no-await-in-loop -- Seed documents sequentially to avoid race conditions
      for (const doc of documents) {
        const docTitle = (doc.slug || doc.title || "unknown") as string

        try {
          // For singletons, check if document already exists
          if (cmsCollection.findOne) {
            // eslint-disable-next-line no-await-in-loop
            const existing = await cmsCollection.findOne({ status: "any" })
            if (existing) {
              results[collectionSlug].skipped.push(docTitle)
              continue
            }
          }

          // Create the document
          // eslint-disable-next-line no-await-in-loop
          await cmsCollection.create(doc)
          results[collectionSlug].created++
          console.log(`[seed] Created ${collectionSlug}: ${docTitle}`)
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e)
          console.error(`[seed] Error creating ${collectionSlug}:`, message)
          results[collectionSlug].skipped.push(docTitle)
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error("[seed] Error:", message)
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}
