import { getRequestEvent } from "@solidjs/web";
import type { BaseBlock } from "../core/types/blocks";
import type { Localized } from "../core/types/pages";
import type { BylineCredit } from "../core/types/bylines";

/** Shape of `/api/content` entries (published content, role-filtered blocks). */
export interface PublicEntry {
  id: string;
  collection: string;
  slug: string;
  title: Localized;
  description: Localized | null;
  tags: Localized[];
  bylines: BylineCredit[];
  publishedAt: string | null;
  updatedAt: string | null;
  blocks: BaseBlock[];
  properties: Record<string, any>;
  /** Taxonomy terms assigned to the entry (categories, tags…). */
  terms: { taxonomy: string; slug: string; label: Localized | string }[];
}

/** A taxonomy term as returned by `/api/content/taxonomies/:taxonomy`. */
export interface PublicTerm {
  id: string;
  taxonomy: string;
  slug: string;
  label: Localized | string;
  description: Localized | null;
  parentId: string | null;
  displayOrder: number;
  /** Published entries using this term. */
  count: number;
}

/**
 * Absolute form of a relative API URL. In the browser relative URLs just work; during SSR
 * there is no page origin, so resolve against the incoming request.
 */
function absolute(url: string): string | null {
  if (/^https?:\/\//.test(url)) return url;
  if (typeof window !== "undefined") return url;
  try {
    const req = getRequestEvent()?.request;
    return req?.url ? new URL(url, req.url).toString() : null;
  } catch {
    return null;
  }
}

/**
 * Reads published content from the CMS delivery API. Works on server and client. Never throws:
 * a network or HTTP failure returns `null` (lists: empty), so a page shows its empty state
 * instead of halting rendering.
 */
export function createContentClient(base = "/api/content") {
  const get = async <T>(
    path: string,
    params: Record<string, string | number | undefined> = {},
  ): Promise<T | null> => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
    );
    // During SSR without a resolvable origin, skip the request: the browser fetches instead.
    const url = absolute(`${base}${path}${qs.size ? `?${qs}` : ""}`);
    if (!url) return null;
    try {
      const res = await fetch(url);
      return res.ok ? ((await res.json()) as T) : null;
    } catch (err) {
      console.warn("[@rimelight/cms] content request failed:", path, err);
      return null;
    }
  };
  return {
    entries: async (
      collection: string,
      opts: {
        limit?: number;
        offset?: number;
        taxonomy?: string;
        term?: string;
        locale?: string;
        orderBy?: "posted" | "updated" | "created" | "title" | "slug";
        /** `false` skips blocks/properties (much smaller; e.g. for navigation). */
        withContent?: boolean;
      } = {},
    ) => {
      const { withContent, ...rest } = opts;
      return (
        (await get<{ entries: PublicEntry[]; total: number }>(`/collections/${collection}`, {
          ...rest,
          ...(withContent === false ? { content: "false" } : {}),
        })) ?? { entries: [], total: 0 }
      );
    },
    /** Pass `preview` (from `?preview=` in the page URL) to read the draft. */
    entry: async (collection: string, slug: string, preview?: string) =>
      (await get<{ entry: PublicEntry }>(`/collections/${collection}/${slug}`, { preview }))
        ?.entry ?? null,
    /** Terms of a taxonomy (e.g. "category"), with published-entry counts. */
    terms: async (taxonomy: string) =>
      (await get<{ terms: PublicTerm[] }>(`/taxonomies/${taxonomy}`))?.terms ?? [],
    docsNav: async (opts: { collection?: string; basePath?: string; locale?: string } = {}) =>
      (await get<{ config: any }>("/docs/nav", opts))?.config ?? null,
    search: async (q: string, collection?: string) =>
      (await get<any[]>("/search", { q, collection })) ?? [],
  };
}

export const content = createContentClient();
