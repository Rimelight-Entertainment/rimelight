import { sql } from "drizzle-orm"

export async function migrateLegacyPagesToCMSv2(db: any) {
  console.log("[Migration] Applying DDL schema updates...")

  await db.execute(sql`
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS template_id UUID;
    ALTER TABLE pages ADD COLUMN IF NOT EXISTS template_version INTEGER DEFAULT 1 NOT NULL;
    ALTER TABLE page_versions ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1 NOT NULL;

    CREATE UNIQUE INDEX IF NOT EXISTS page_versions_page_id_version_idx
    ON page_versions (page_id, version_number);
  `)

  console.log("[Migration] Transforming legacy page content in chunked batches...")

  const BATCH_SIZE = 100
  let offset = 0

  async function fetchBatch(currentOffset: number) {
    const batch = await db.execute(sql`
      SELECT id, content FROM pages ORDER BY id LIMIT ${BATCH_SIZE} OFFSET ${currentOffset};
    `)

    if (!batch || !batch.rows || batch.rows.length === 0) {
      return null
    }

    return batch.rows as unknown as Array<{ id: string; content: unknown }>
  }

  async function processBatch(pagesList: Array<{ id: string; content: unknown }>) {
    const updatePromises = pagesList.map((page) => {
      const transformed = transformLegacyContent(page.content)
      return db.execute(sql`
        UPDATE pages SET content = ${JSON.stringify(transformed)}::jsonb WHERE id = ${page.id}::uuid;
      `)
    })

    await Promise.all(updatePromises)
  }

  let pagesList = await fetchBatch(offset)
  while (pagesList !== null) {
    await processBatch(pagesList)
    offset += BATCH_SIZE
    console.log(`[Migration] Migrated ${offset} records...`)
    pagesList = await fetchBatch(offset)
  }

  console.log("[Migration] Migration completed successfully.")
}

export function transformLegacyContent(raw: unknown) {
  if (typeof raw === "object" && raw !== null && "blocks" in raw) return raw
  let textContent = ""
  try {
    textContent = typeof raw === "string" ? raw : JSON.stringify(raw ?? "")
  } catch {
    textContent = ""
  }
  return {
    blocks: [
      {
        id: crypto.randomUUID(),
        type: "ParagraphBlock",
        props: { text: { en: textContent } }
      }
    ],
    properties: {}
  }
}
