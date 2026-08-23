import { eq, and, isNull, or } from "drizzle-orm"
import { bylines, type Byline, type NewByline } from "../schema/bylines.ts"

/**
 * Returns all active (non-deleted) bylines.
 */
export async function getBylines(db: any): Promise<Byline[]> {
  if (!db) return []
  return db.select().from(bylines).where(isNull(bylines.deletedAt)).orderBy(bylines.name)
}

/**
 * Retrieves a single byline by ID or slug.
 */
export async function getByline(db: any, idOrSlug: string): Promise<Byline | null> {
  if (!db || !idOrSlug) return null
  const rows = await db
    .select()
    .from(bylines)
    .where(
      and(
        isNull(bylines.deletedAt),
        or(eq(bylines.id, idOrSlug as any), eq(bylines.slug, idOrSlug))
      )
    )
    .limit(1)

  return rows[0] || null
}

/**
 * Creates a new byline.
 */
export async function createByline(db: any, data: NewByline): Promise<Byline> {
  const [created] = await db
    .insert(bylines)
    .values({
      ...data,
      updatedAt: new Date()
    })
    .returning()
  return created
}

/**
 * Updates an existing byline.
 */
export async function updateByline(
  db: any,
  id: string,
  data: Partial<NewByline>
): Promise<Byline | null> {
  const [updated] = await db
    .update(bylines)
    .set({
      ...data,
      updatedAt: new Date()
    })
    .where(and(eq(bylines.id, id as any), isNull(bylines.deletedAt)))
    .returning()
  return updated || null
}

/**
 * Soft deletes a byline.
 */
export async function deleteByline(db: any, id: string): Promise<boolean> {
  const [deleted] = await db
    .update(bylines)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(bylines.id, id as any), isNull(bylines.deletedAt)))
    .returning()
  return !!deleted
}
