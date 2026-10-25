import type { Dialect, CmsTables } from "../db/index";
import { tablesFor } from "../db/index";
import { BlockRegistry } from "../core/blocks/registry";
import { builtinBlocks } from "../core/blocks/builtins";
import type { CollectionDefinition } from "../core/collections/types";
import type { BlockDefinition } from "../core/blocks/registry";
import type { TaxonomyDefinition } from "../core/types/taxonomies";
import { hasAnyRole, isAdmin } from "../auth/roles";

/** The authenticated user performing an operation. */
export interface CmsActor {
  userId: string;
  name?: string;
  roles: string[];
  permissions: string[];
}

export const SYSTEM_ACTOR: CmsActor = {
  userId: "system",
  name: "System",
  roles: ["owner"],
  permissions: ["*"],
};

/** Everything a service needs. Cheap to build per request. */
export interface CmsContext {
  db: any;
  dialect: Dialect;
  t: CmsTables;
  blocks: BlockRegistry;
  collections: CollectionDefinition[];
  taxonomies: TaxonomyDefinition[];
  locales: string[];
  previewSecret?: string;
}

export interface CmsContextInput {
  db: any;
  dialect: Dialect;
  blocks?: BlockDefinition<any>[];
  collections?: CollectionDefinition[];
  taxonomies?: TaxonomyDefinition[];
  locales?: string[];
  previewSecret?: string;
}

export const DEFAULT_TAXONOMIES: TaxonomyDefinition[] = [
  { slug: "category", label: "Categories", hierarchical: true },
  { slug: "tag", label: "Tags", hierarchical: false },
];

export function createCmsContext(input: CmsContextInput): CmsContext {
  const registry = new BlockRegistry().register(...builtinBlocks, ...(input.blocks ?? []));
  const taxonomies = [...DEFAULT_TAXONOMIES];
  for (const t of input.taxonomies ?? []) {
    const i = taxonomies.findIndex((x) => x.slug === t.slug);
    if (i >= 0) taxonomies[i] = t;
    else taxonomies.push(t);
  }
  return {
    db: input.db,
    dialect: input.dialect,
    t: tablesFor(input.dialect),
    blocks: registry,
    collections: input.collections ?? [],
    taxonomies,
    locales: input.locales ?? ["en"],
    ...(input.previewSecret ? { previewSecret: input.previewSecret } : {}),
  };
}

/** Error with an HTTP status. Routers and MCP translate it into a response. */
export class CmsError extends Error {
  constructor(
    public status: 400 | 401 | 403 | 404 | 409 | 422 | 500,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "CmsError";
  }
}

export const notFound = (what: string): CmsError => new CmsError(404, `${what} not found`);

/** JSON columns come back as strings from some drivers (raw D1, neon raw text mode). */
export function json<T>(value: unknown, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return value as T;
}

export { isAdmin, hasAnyRole };

export function requireRole(actor: CmsActor, roles: string[] | undefined, action: string): void {
  if (!hasAnyRole(actor, roles)) throw new CmsError(403, `Not allowed to ${action}`);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9/]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/(^[-/]+)|([-/]+$)/g, "");
}
