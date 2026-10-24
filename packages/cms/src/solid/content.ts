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
}

/** Reads published content from the CMS delivery API. Works on server and client. */
export function createContentClient(base = "/api/content") {
  const get = async <T>(
    path: string,
    params: Record<string, string | number | undefined> = {},
  ): Promise<T | null> => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][],
    );
    const res = await fetch(`${base}${path}${qs.size ? `?${qs}` : ""}`);
    return res.ok ? ((await res.json()) as T) : null;
  };
  return {
    entries: async (
      collection: string,
      opts: { limit?: number; offset?: number; taxonomy?: string; term?: string } = {},
    ) =>
      (await get<{ entries: PublicEntry[]; total: number }>(
        `/collections/${collection}`,
        opts,
      )) ?? { entries: [], total: 0 },
    /** Pass `preview` (from `?preview=` in the page URL) to read the draft. */
    entry: async (collection: string, slug: string, preview?: string) =>
      (await get<{ entry: PublicEntry }>(`/collections/${collection}/${slug}`, { preview }))
        ?.entry ?? null,
    docsNav: async (opts: { collection?: string; basePath?: string; locale?: string } = {}) =>
      (await get<{ config: any }>("/docs/nav", opts))?.config ?? null,
    search: async (q: string, collection?: string) =>
      (await get<any[]>("/search", { q, collection })) ?? [],
  };
}

export const content = createContentClient();
