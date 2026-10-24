import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { extractTextFromBlocks } from "../core/excerpt";
import { resolveLabel } from "../core/collections/define";
import { entryUrl } from "../core/collections/color";
import { getCollection } from "./collections";
import type { CmsContext } from "./context";
import type { Entry } from "./entries";

/**
 * Full-text search over published entries, stored in `search_index` (one row per entry).
 * Postgres uses a tsvector; SQLite falls back to LIKE matching on the same table.
 */


export async function indexEntry(ctx: CmsContext, entry: Entry) {
  const collection = await getCollection(ctx, entry.collection).catch(() => null);
  if (collection && !collection.features.search) return;
  const s = ctx.t.searchIndex;
  const title = resolveLabel(entry.title) || entry.slug;
  const body = [
    resolveLabel(entry.description ?? undefined),
    ...ctx.locales.map((l) => extractTextFromBlocks(entry.published.blocks, l)),
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 100_000);
  const url = entryUrl(collection?.features.routable ?? true, entry);
  const values: Record<string, any> = {
    sourceType: entry.collection,
    sourceId: entry.id,
    title,
    url,
    bodyContent: body,
    updatedAt: new Date(),
    searchableText:
      ctx.dialect === "pg"
        ? sql`setweight(to_tsvector('simple', ${title}), 'A') || setweight(to_tsvector('simple', ${body}), 'B')`
        : `${title}\n${body}`.toLowerCase(),
  };
  await ctx.db
    .insert(s)
    .values(values)
    .onConflictDoUpdate({ target: [s.sourceType, s.sourceId], set: values });
}

export async function removeEntryFromIndex(ctx: CmsContext, entryId: string) {
  await ctx.db.delete(ctx.t.searchIndex).where(eq(ctx.t.searchIndex.sourceId, entryId));
}

export interface SearchHit {
  title: string;
  url: string;
  sourceType: string;
  sourceId: string;
  snippet: string;
  rank?: number;
}

export async function searchEntries(
  ctx: CmsContext,
  q: string,
  { collection, limit = 10 }: { collection?: string; limit?: number } = {},
): Promise<SearchHit[]> {
  const query = q.trim();
  if (!query) return [];
  const s = ctx.t.searchIndex;
  const scope = collection ? eq(s.sourceType, collection) : undefined;

  if (ctx.dialect === "pg") {
    const terms = query
      .replace(/[!|&():*'\\]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    const tsq = sql`to_tsquery('simple', ${terms.map((t) => `${t}:*`).join(" & ")})`;
    const rank = sql<number>`ts_rank(${s.searchableText}, ${tsq})`;
    return ctx.db
      .select({
        title: s.title,
        url: s.url,
        sourceType: s.sourceType,
        sourceId: s.sourceId,
        rank,
        snippet: sql<string>`ts_headline('simple', ${s.bodyContent}, ${tsq}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=24, MinWords=8')`,
      })
      .from(s)
      .where(and(sql`(${s.searchableText} @@ ${tsq} or ${s.title} ilike ${`%${query}%`})`, scope))
      .orderBy(desc(rank), desc(s.updatedAt))
      .limit(limit);
  }

  const pattern = `%${query.toLowerCase()}%`;
  const rows = await ctx.db
    .select({
      title: s.title,
      url: s.url,
      sourceType: s.sourceType,
      sourceId: s.sourceId,
      body: s.bodyContent,
    })
    .from(s)
    .where(and(or(like(s.searchableText, pattern), like(s.title, pattern)), scope))
    .orderBy(desc(s.updatedAt))
    .limit(limit);
  return rows.map((r: any) => {
    const i = r.body.toLowerCase().indexOf(query.toLowerCase());
    const start = Math.max(0, i - 60);
    return { ...r, snippet: i < 0 ? r.body.slice(0, 160) : r.body.slice(start, start + 160) };
  });
}

/** Rebuilds the index from every published entry (admin maintenance / after enabling search). */
export async function reindexAll(ctx: CmsContext) {
  const { listEntries, getEntry } = await import("./entries");
  let offset = 0;
  let count = 0;
  for (;;) {
    const page = await listEntries(ctx, { status: "published", limit: 100, offset });
    for (const e of page.entries) {
      await indexEntry(ctx, await getEntry(ctx, e.id));
      count++;
    }
    if (page.entries.length < 100) break;
    offset += 100;
  }
  return { indexed: count };
}
