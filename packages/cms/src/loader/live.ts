import { and, desc, eq, isNotNull, isNull, lte, sql, type SQL } from "drizzle-orm";
import { pages } from "../schema/pages";
import { createPageExcerpt } from "../core/excerpt";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized, PageType } from "../core/types/pages";

import { taxonomyTerms, pageTaxonomyTerms } from "../schema/taxonomies";

export interface CmsLoaderOptions {
  type?: PageType | undefined;
  db?: any;
  locale?: string | undefined;
  includeDrafts?: boolean | undefined;
  includeScheduled?: boolean | undefined;
  taxonomy?:
    | {
        category?: string | undefined;
        tag?: string | undefined;
        [key: string]: string | undefined;
      }
    | undefined;
}

export interface CmsPageData {
  id: string;
  slug: string;
  type: PageType;
  title: Localized;
  resolvedTitle: string;
  description?: Localized;
  resolvedDescription: string;
  excerpt: string;
  tags: Localized[];
  authorIds: string[];
  blocks: BaseBlock[];
  properties: Record<string, any>;
  publishedVersionId: string | null;
  postedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CmsEntry {
  id: string;
  data: CmsPageData;
}

export interface CacheHint {
  tags?: string[];
  lastModified?: Date;
  maxAge?: number;
}

function resolveLocalized(val: unknown, locale: string = "en"): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const rec = val as Record<string, string>;
    return rec[locale] || rec["en"] || Object.values(rec)[0] || "";
  }
  return typeof val === "number" ? String(val) : "";
}

function transformPageToEntry(rawPage: any, locale: string = "en"): CmsEntry {
  let contentObj = rawPage.content;
  if (typeof contentObj === "string") {
    try {
      contentObj = JSON.parse(contentObj);
    } catch {
      contentObj = { blocks: [], properties: {} };
    }
  } else if (!contentObj || typeof contentObj !== "object") {
    contentObj = { blocks: [], properties: {} };
  }

  const blocks: BaseBlock[] = Array.isArray(contentObj.blocks) ? contentObj.blocks : [];
  const properties: Record<string, any> = contentObj.properties || {};

  const resolvedTitle = resolveLocalized(rawPage.title, locale);
  const resolvedDescription = resolveLocalized(rawPage.description, locale);
  const excerpt = createPageExcerpt(rawPage, { locale, maxLength: 160 });

  return {
    id: rawPage.slug || rawPage.id,
    data: {
      id: rawPage.id,
      slug: rawPage.slug,
      type: rawPage.type,
      title: rawPage.title,
      resolvedTitle,
      description: rawPage.description,
      resolvedDescription,
      excerpt,
      tags: rawPage.tags || [],
      authorIds: rawPage.authorIds || [],
      blocks,
      properties,
      publishedVersionId: rawPage.publishedVersionId,
      postedAt: rawPage.postedAt ? new Date(rawPage.postedAt) : null,
      createdAt: new Date(rawPage.createdAt),
      updatedAt: rawPage.updatedAt ? new Date(rawPage.updatedAt) : null,
    },
  };
}

/**
 * Direct querying helper for CMS collections.
 */
export async function getCmsCollection(
  db: any,
  options: CmsLoaderOptions & {
    limit?: number | undefined;
    offset?: number | undefined;
    where?: SQL | undefined;
  } = {},
): Promise<{ entries: CmsEntry[]; cacheHint: CacheHint }> {
  const {
    type,
    locale = "en",
    includeDrafts = false,
    includeScheduled = false,
    limit,
    offset,
    where: customWhere,
  } = options;

  if (!db) {
    return { entries: [], cacheHint: { tags: ["cms"] } };
  }

  const conditions: SQL[] = [isNull(pages.deletedAt)];

  if (type) {
    conditions.push(eq(pages.type, type));
  }

  if (!includeDrafts) {
    conditions.push(isNotNull(pages.publishedVersionId));
  }

  if (!includeScheduled) {
    conditions.push(lte(pages.postedAt, new Date()));
  }

  if (customWhere) {
    conditions.push(customWhere);
  }

  if (options.taxonomy) {
    for (const [taxName, termSlug] of Object.entries(options.taxonomy)) {
      if (termSlug) {
        conditions.push(
          sql`${pages.id} IN (
            SELECT ${pageTaxonomyTerms.pageId} FROM ${pageTaxonomyTerms}
            INNER JOIN ${taxonomyTerms} ON ${taxonomyTerms.id} = ${pageTaxonomyTerms.termId}
            WHERE ${taxonomyTerms.taxonomy} = ${taxName} AND ${taxonomyTerms.slug} = ${termSlug}
          )`,
        );
      }
    }
  }

  let query = db
    .select()
    .from(pages)
    .where(and(...conditions))
    .orderBy(desc(pages.postedAt));

  if (typeof limit === "number") {
    query = query.limit(limit);
  }

  if (typeof offset === "number") {
    query = query.offset(offset);
  }

  const rows = await query;
  const entries = rows.map((r: any) => transformPageToEntry(r, locale));

  let lastModified = new Date(0);
  for (const entry of entries) {
    if (entry.data.updatedAt && entry.data.updatedAt > lastModified) {
      lastModified = entry.data.updatedAt;
    }
  }

  const tags = ["cms"];
  if (type) tags.push(`cms:${type}`);

  return {
    entries,
    cacheHint: {
      tags,
      lastModified: lastModified.getTime() > 0 ? lastModified : new Date(),
    },
  };
}

/**
 * Direct querying helper for a single CMS entry by slug or id.
 */
export async function getCmsEntry(
  db: any,
  slugOrId: string,
  options: CmsLoaderOptions = {},
): Promise<{ entry: CmsEntry | null; cacheHint: CacheHint }> {
  const { entries, cacheHint } = await getCmsCollection(db, {
    ...options,
    limit: 1,
    where: eq(pages.slug, slugOrId),
  });

  const entry = entries[0] || null;
  if (entry) {
    cacheHint.tags?.push(`page:${entry.data.slug}`);
  }

  return { entry, cacheHint };
}

export interface CmsCollectionFilter {
  limit?: number | undefined;
  offset?: number | undefined;
}

export interface CmsLoader {
  name: string;
  loadCollection: (context?: {
    filter?: CmsCollectionFilter | undefined;
    collection?: string | undefined;
  }) => Promise<{ entries: CmsEntry[]; cacheHint: CacheHint }>;
  loadEntry: (context: {
    filter: { id: string };
    collection?: string | undefined;
  }) => Promise<{ id: string; data: CmsPageData; cacheHint: CacheHint } | undefined>;
}

/**
 * Framework-agnostic CMS collection loader. Works with any runtime — call `loadCollection()` /
 * `loadEntry()` from Solid resources, Hono handlers, or build scripts.
 */
export function rimelightCmsLoader(loaderOptions: CmsLoaderOptions = {}): CmsLoader {
  return {
    name: "rimelight-cms-loader",
    loadCollection: async (context = {}) => {
      const db = loaderOptions.db || (globalThis as any).db;
      const limit = typeof context.filter?.limit === "number" ? context.filter.limit : undefined;
      const offset = typeof context.filter?.offset === "number" ? context.filter.offset : undefined;

      return getCmsCollection(db, {
        ...loaderOptions,
        limit,
        offset,
      });
    },
    loadEntry: async (context: { filter: { id: string }; collection?: string | undefined }) => {
      const db = loaderOptions.db || (globalThis as any).db;
      const { entry, cacheHint } = await getCmsEntry(db, context.filter.id, loaderOptions);
      if (!entry) return undefined;
      return {
        id: entry.id,
        data: entry.data,
        cacheHint,
      };
    },
  };
}

/**
 * Alias for the framework-agnostic loader.
 */
export const createCmsLoader = rimelightCmsLoader;
