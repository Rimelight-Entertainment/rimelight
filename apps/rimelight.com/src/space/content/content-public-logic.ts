/**
 * Pure helpers of the public read API (content-public.ts): row mapping, mention filling, colours and hrefs.
 * Kept apart from the routes so tests can load them without the Workers runtime.
 */
import { UUID, type Row } from "../canvas-access.ts";
import { type ContentBlock, filterBlocks } from "./content-access.ts";

/* ---------- types ---------- */

type Localized = Record<string, string>;

/** A taxonomy term as an entry carries it: the taxonomy, its slug and its label. */
export type PublicTermRef = { taxonomy: string; slug: string; label: Localized | string };

/** An entry as the website reads it (the CMS PublicEntry, mentions filled). */
export type PublicEntry = {
  id: string;
  collection: string;
  slug: string;
  title: Localized;
  description: Localized | null;
  tags: unknown[];
  bylines: unknown[];
  publishedAt: string | null;
  updatedAt: string | null;
  blocks: ContentBlock[];
  properties: Record<string, unknown>;
  terms: PublicTermRef[];
};

/** A stored mention: a reference to an entry, with snapshots that delivery replaces. */
export type MentionNode = {
  type: "mention";
  entryId: string;
  collection?: string;
  slug?: string;
  title?: string;
  color?: string;
  href?: string;
  [key: string]: unknown;
};

/** What delivery needs from the target of a mention. `public` is true only for a Public, published, undeleted page. */
export type MentionTarget = { collection: string; slug: string; title: unknown; public: boolean };

/** A collection (content type) as mentions need it: its explicit colour, and its features (routable). */
export type CollectionInfo = { color: string | null; features: Record<string, unknown> };

/* ---------- pure helpers (unit tested: test/space-content-public.test.ts) ---------- */

/** A jsonb value as the driver returns it: parsed already, or still text. Anything unparseable passes through. */
export function parseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

/** An ISO string for a timestamp, or null. */
export function isoOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value as string);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** The label in `locale`, then `en`, then the first value present (the CMS resolveLabel). */
export function resolveLabel(label: unknown, locale = "en"): string {
  if (!label) return "";
  if (typeof label === "string") return label;
  const map = label as Record<string, string>;
  return map[locale] ?? map["en"] ?? Object.values(map)[0] ?? "";
}

/** The CMS delivery Cache-Control value for `seconds`. */
export function cacheControl(seconds = 60): string {
  return `public, max-age=${seconds}, s-maxage=${seconds * 5}, stale-while-revalidate=86400`;
}

/**
 * The roles a website reader's role-restricted blocks are checked against (owner, 2026-11-23: shown when signed in,
 * as the CMS did). Anonymous: none. Signed in: the session's roles, or `member` when it has none.
 */
export function readerRolesFor(session: { roles?: unknown } | null): string[] {
  if (!session) return [];
  const roles = Array.isArray(session.roles)
    ? session.roles.filter((r): r is string => typeof r === "string" && r !== "")
    : [];
  return roles.length ? roles : ["member"];
}

/**
 * Cache-Control for a response: shared caching for anonymous readers; never stored by a shared cache when the
 * response was filtered for a signed-in reader's roles.
 */
export function cacheControlFor(readerRoles: string[], seconds = 60): string {
  return readerRoles.length ? "private, no-store" : cacheControl(seconds);
}

/** A row of the Public, published, undeleted pages (the public filter, as SQL in publicWhere) as a public entry. */
export function entryFromRow(
  row: Row,
  terms: PublicTermRef[] = [],
  withContent = true,
  readerRoles: string[] = [],
): PublicEntry {
  const content = (parseJson(row["content"]) ?? {}) as {
    blocks?: unknown;
    properties?: Record<string, unknown>;
  };
  const blocks =
    withContent && Array.isArray(content.blocks)
      ? filterBlocks(content.blocks as ContentBlock[], readerRoles, "public")
      : [];
  return {
    id: String(row["id"]),
    collection: String(row["type"]),
    slug: String(row["slug"]),
    title: (parseJson(row["title"]) as Localized | null) ?? { en: "" },
    description: (parseJson(row["description"]) as Localized | null) ?? null,
    tags: (parseJson(row["tags"]) as unknown[] | null) ?? [],
    bylines: (parseJson(row["bylines"]) as unknown[] | null) ?? [],
    publishedAt: isoOrNull(row["posted_at"]),
    updatedAt: isoOrNull(row["updated_at"]),
    blocks,
    properties: withContent ? (content.properties ?? {}) : {},
    terms,
  };
}

/** A taxonomy term row (with its Public published count) as the CMS term shape. */
export function termView(row: Row) {
  const label = parseJson(row["label"]) as Localized | string;
  const count = Number(row["count"] ?? 0);
  return {
    id: String(row["id"]),
    taxonomy: String(row["taxonomy"]),
    slug: String(row["slug"]),
    label,
    name: resolveLabel(label),
    description: (parseJson(row["description"]) as Localized | string | null) ?? null,
    parentId: (row["parent_id"] as string | null) ?? null,
    displayOrder: Number(row["display_order"] ?? 0),
    count,
    postCount: count,
    createdAt: isoOrNull(row["created_at"]),
    updatedAt: isoOrNull(row["updated_at"]),
  };
}

/** A byline row as the CMS byline shape (camelCase, as drizzle returns it). */
export function bylineView(row: Row) {
  return {
    id: String(row["id"]),
    name: row["name"],
    slug: row["slug"],
    websiteUrl: (row["website_url"] as string | null) ?? null,
    bio: (row["bio"] as string | null) ?? null,
    avatar: (row["avatar"] as string | null) ?? null,
    userId: (row["user_id"] as string | null) ?? null,
    socials: parseJson(row["socials"]) ?? {},
    metadata: parseJson(row["metadata"]) ?? {},
    isGuest: row["is_guest"] === true || row["is_guest"] === "t",
    fields: parseJson(row["fields"]) ?? {},
    createdAt: isoOrNull(row["created_at"]),
    updatedAt: isoOrNull(row["updated_at"]),
    deletedAt: isoOrNull(row["deleted_at"]),
  };
}

/** The href of an entry from a collection's `routable` pattern (the CMS entryUrl; a non-string pattern gives the default). */
export function entryHref(pattern: unknown, entry: { slug: string; collection: string }): string {
  if (typeof pattern !== "string") return `/${entry.collection}/${entry.slug}`;
  return pattern.replace("{slug}", entry.slug).replace("{collection}", entry.collection);
}

const PALETTE = [
  "#e5484d",
  "#f76b15",
  "#ffb224",
  "#46a758",
  "#12a594",
  "#0090ff",
  "#3e63dd",
  "#8e4ec6",
  "#d6409f",
  "#a18072",
  "#00a2c7",
  "#978365",
] as const;

/** FNV-1a, as the CMS collection colour hash. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * The colour of a collection: its explicit colour, or a palette colour derived from the slug.
 * UNSURE: copied from packages/cms/src/core/collections/color.ts (the palette and hash must stay identical to it).
 */
export function collectionColor(slug: string, explicit?: string | null): string {
  if (explicit) return explicit;
  return PALETTE[hash(slug || "page") % PALETTE.length]!;
}

const isMention = (v: unknown): v is MentionNode =>
  !!v &&
  typeof v === "object" &&
  (v as { type?: unknown }).type === "mention" &&
  typeof (v as { entryId?: unknown }).entryId === "string";

function collectMentions(value: unknown, out: MentionNode[]): void {
  if (Array.isArray(value)) value.forEach((v) => collectMentions(v, out));
  else if (isMention(value)) out.push(value);
  else if (value && typeof value === "object")
    Object.values(value).forEach((v) => collectMentions(v, out));
}

function rewriteMentions(value: unknown, fn: (m: MentionNode) => MentionNode): unknown {
  if (Array.isArray(value)) return value.map((v) => rewriteMentions(v, fn));
  if (isMention(value)) return fn(value);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = rewriteMentions(v, fn);
    return out;
  }
  return value;
}

/** The ids of the mentioned entries (valid UUIDs only) in the blocks and properties of the given entries. */
export function mentionIds(entries: { blocks: unknown[]; properties: unknown }[]): string[] {
  const found: MentionNode[] = [];
  for (const e of entries) collectMentions([e.blocks, e.properties], found);
  return [...new Set(found.map((m) => m.entryId))].filter((id) => UUID.test(id));
}

/**
 * Fills every mention in the entries from its target (the CMS resolveMentions). A Public, published target gets its
 * current title and slug and an href; any other target keeps its stored slug and title and gets no href. The colour
 * is the collection's colour, derived from the slug when the collection has none.
 */
export function fillMentions<
  T extends { blocks: ContentBlock[]; properties: Record<string, unknown> },
>(
  entries: T[],
  targets: Map<string, MentionTarget>,
  collections: Map<string, CollectionInfo>,
  locale = "en",
): T[] {
  const fill = (m: MentionNode): MentionNode => {
    const target = targets.get(m.entryId);
    const collection = target ? target.collection : (m.collection ?? "");
    const def = collections.get(collection);
    const { href: _href, color: _color, ...stored } = m;
    let slug = m.slug;
    let title = m.title;
    // UNSURE: the CMS fills title and slug from every target, Internal ones too. This keeps an Internal page's title
    // and slug out of public output; the stored snapshot (already in the content) is what remains.
    if (target?.public) {
      slug = target.slug.replace(/^\/+/, "");
      const current = resolveLabel(target.title as Localized | string, locale);
      if (current) title = current;
    }
    const routable = def?.features["routable"] ?? true;
    return {
      ...stored,
      collection,
      ...(slug !== undefined ? { slug } : {}),
      ...(title ? { title } : {}),
      color: collectionColor(collection, def?.color),
      ...(target?.public ? { href: entryHref(routable, { slug: slug ?? "", collection }) } : {}),
    };
  };
  return entries.map((item) => ({
    ...item,
    blocks: rewriteMentions(item.blocks, fill) as ContentBlock[],
    properties: rewriteMentions(item.properties, fill) as Record<string, unknown>,
  }));
}
