import { inArray } from "drizzle-orm";
import type { CmsContext } from "./context";
import { listCollections } from "./collections";
import { collectionColor, entryUrl } from "../core/collections/color";
import { resolveLabel } from "../core/collections/define";
import type { BaseBlock } from "../core/types/blocks";
import type { MentionInlineNode } from "../core/types/inline";

/**
 * Delivery-time mention resolution. Stored mentions only reference an entry
 * (`entryId`, `collection`, plus slug/title snapshots). Before content reaches readers, every
 * mention is filled in with its collection's current colour, the entry's current title and
 * URL — or no URL when the target isn't published — so renderers need no configuration and
 * renamed / moved entries never leave stale links.
 */

const isMention = (v: any): v is MentionInlineNode =>
  !!v && typeof v === "object" && v.type === "mention" && typeof v.entryId === "string";

function collect(value: unknown, out: MentionInlineNode[]) {
  if (Array.isArray(value)) value.forEach((v) => collect(v, out));
  else if (isMention(value)) out.push(value);
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collect(v, out));
}

function rewrite(value: unknown, fn: (m: MentionInlineNode) => MentionInlineNode): any {
  if (Array.isArray(value)) return value.map((v) => rewrite(v, fn));
  if (isMention(value)) return fn(value);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewrite(v, fn);
    return out;
  }
  return value;
}

export async function resolveMentions<T extends { blocks: BaseBlock[]; properties: any }>(
  ctx: CmsContext,
  items: T[],
  locale = "en",
): Promise<T[]> {
  const found: MentionInlineNode[] = [];
  for (const item of items) collect([item.blocks, item.properties], found);
  if (!found.length) return items;

  const ids = [...new Set(found.map((m) => m.entryId))];
  const p = ctx.t.pages;
  const [rows, collections] = await Promise.all([
    ctx.db
      .select({
        id: p.id,
        type: p.type,
        slug: p.slug,
        title: p.title,
        status: p.status,
        deletedAt: p.deletedAt,
      })
      .from(p)
      .where(inArray(p.id, ids)),
    listCollections(ctx),
  ]);
  const byId = new Map<string, any>(rows.map((r: any) => [String(r.id), r]));
  const bySlug = new Map(collections.map((c) => [c.slug, c]));

  const fill = (m: MentionInlineNode): MentionInlineNode => {
    const row = byId.get(m.entryId);
    const collection = row ? String(row.type) : m.collection;
    const def = bySlug.get(collection);
    const live = row && !row.deletedAt && row.status === "published";
    const slug = row ? String(row.slug).replace(/^\/+/, "") : m.slug;
    const rawTitle = row
      ? typeof row.title === "string"
        ? JSON.parse(row.title)
        : row.title
      : null;
    const title = (rawTitle && resolveLabel(rawTitle, locale)) || m.title;
    const { href: _h, color: _c, ...stored } = m;
    return {
      ...stored,
      collection,
      slug,
      ...(title ? { title } : {}),
      color: collectionColor(collection, def?.color),
      ...(live ? { href: entryUrl(def?.features.routable ?? true, { slug, collection }) } : {}),
    };
  };

  return items.map((item) => ({
    ...item,
    blocks: rewrite(item.blocks, fill),
    properties: rewrite(item.properties, fill),
  }));
}
