import { createPageExcerpt } from "../core/excerpt";
import { resolveLabel } from "../core/collections/define";
import { getCmsDb } from "../db/index";
import { createCms, type Cms } from "../services/index";
import type { EntrySummary } from "../services/entries";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized, PageType } from "../core/types/pages";
import type { CmsConfig } from "../types";

/**
 * Server-side read helpers for site code (SSR routes, build scripts). Read published content
 * straight through the service layer — no HTTP round trip.
 */

export interface CmsLoaderOptions {
  /** Drizzle instance / D1 binding, or a ready `Cms`. */
  db?: any;
  cms?: Cms;
  config?: CmsConfig;
  /** Collection slug (historically "type"). */
  type?: PageType | undefined;
  locale?: string | undefined;
  includeDrafts?: boolean | undefined;
  taxonomy?: { taxonomy: string; term: string } | undefined;
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
  bylines: unknown[];
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

function cmsFrom(options: CmsLoaderOptions): Cms {
  if (options.cms) return options.cms;
  const { db, dialect } = getCmsDb({ db: options.db });
  return createCms({
    db,
    dialect,
    collections: options.config?.collections ?? [],
    blocks: options.config?.blocks ?? [],
    locales: options.config?.locales ?? ["en"],
  });
}

function toLoaderEntry(e: EntrySummary, locale: string): CmsEntry {
  const content = e.published ?? { blocks: [], properties: {} };
  const description = e.description ?? undefined;
  return {
    id: e.slug,
    data: {
      id: e.id,
      slug: e.slug,
      type: e.collection,
      title: e.title,
      resolvedTitle: resolveLabel(e.title, locale),
      ...(description ? { description } : {}),
      resolvedDescription: resolveLabel(description, locale),
      excerpt: createPageExcerpt({ ...e, content }, { locale, maxLength: 160 }),
      tags: e.tags,
      authorIds: e.authorIds,
      bylines: e.bylines,
      blocks: content.blocks,
      properties: content.properties,
      publishedVersionId: e.publishedVersionId,
      postedAt: e.postedAt,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    },
  };
}

function hint(entries: CmsEntry[], type?: string): CacheHint {
  const last = entries.reduce((m, e) => Math.max(m, (e.data.updatedAt ?? e.data.createdAt).getTime()), 0);
  return { tags: ["cms", ...(type ? [`cms:${type}`] : [])], lastModified: last ? new Date(last) : new Date() };
}

export async function getCmsCollection(
  dbOrOptions: any,
  options: CmsLoaderOptions & { limit?: number; offset?: number } = {},
): Promise<{ entries: CmsEntry[]; cacheHint: CacheHint }> {
  const opts = dbOrOptions?.select || dbOrOptions?.prepare ? { ...options, db: dbOrOptions } : { ...dbOrOptions, ...options };
  const cms = cmsFrom(opts);
  const locale = opts.locale ?? "en";
  const { entries } = await cms.entries.listEntries({
    ...(opts.type ? { collection: opts.type } : {}),
    ...(opts.includeDrafts ? {} : { status: "published" }),
    ...(opts.taxonomy ? { taxonomy: opts.taxonomy } : {}),
    orderBy: "posted",
    includeContent: true,
    limit: opts.limit ?? 500,
    offset: opts.offset ?? 0,
  });
  const mapped = entries.map((e) => toLoaderEntry(e, locale));
  return { entries: mapped, cacheHint: hint(mapped, opts.type) };
}

export async function getCmsEntry(
  dbOrOptions: any,
  slugOrId: string,
  options: CmsLoaderOptions = {},
): Promise<{ entry: CmsEntry | null; cacheHint: CacheHint }> {
  const opts = dbOrOptions?.select || dbOrOptions?.prepare ? { ...options, db: dbOrOptions } : { ...dbOrOptions, ...options };
  const cms = cmsFrom(opts);
  const full = await cms.entries.getEntry(slugOrId, opts.type).catch(() => null);
  if (!full || full.deletedAt || (!opts.includeDrafts && full.status !== "published")) {
    return { entry: null, cacheHint: { tags: ["cms"] } };
  }
  const { draft, published, ...rest } = full;
  const entry = toLoaderEntry(
    { ...rest, excerptTitle: "", published: opts.includeDrafts ? draft : published },
    opts.locale ?? "en",
  );
  return { entry, cacheHint: { ...hint([entry], opts.type), tags: ["cms", `page:${entry.data.slug}`] } };
}

export interface CmsLoader {
  name: string;
  loadCollection: (context?: { filter?: { limit?: number; offset?: number } }) => Promise<{ entries: CmsEntry[]; cacheHint: CacheHint }>;
  loadEntry: (context: { filter: { id: string } }) => Promise<(CmsEntry & { cacheHint: CacheHint }) | undefined>;
}

export function rimelightCmsLoader(loaderOptions: CmsLoaderOptions = {}): CmsLoader {
  return {
    name: "rimelight-cms-loader",
    loadCollection: (context = {}) =>
      getCmsCollection(loaderOptions, {
        ...(context.filter?.limit !== undefined ? { limit: context.filter.limit } : {}),
        ...(context.filter?.offset !== undefined ? { offset: context.filter.offset } : {}),
      } as any),
    loadEntry: async (context) => {
      const { entry, cacheHint } = await getCmsEntry(loaderOptions, context.filter.id);
      return entry ? { ...entry, cacheHint } : undefined;
    },
  };
}

export const createCmsLoader = rimelightCmsLoader;
