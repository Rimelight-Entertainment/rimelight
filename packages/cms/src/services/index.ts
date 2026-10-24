import { and, eq, isNull, sql } from "drizzle-orm";
import { createCmsContext, type CmsActor, type CmsContext, type CmsContextInput } from "./context";
import * as collections from "./collections";
import * as entries from "./entries";
import * as templates from "./templates";
import * as taxonomies from "./taxonomies";
import * as bylines from "./bylines";
import * as search from "./search";
import * as settings from "./site-settings";

export * from "./context";
export * from "./collections";
export * from "./entries";
export * from "./templates";
export * from "./taxonomies";
export * from "./bylines";
export * from "./search";
export * from "./site-settings";

type Bound<F> = F extends (ctx: CmsContext, ...args: infer A) => infer R ? (...args: A) => R : never;
type BindAll<M> = { [K in keyof M as M[K] extends (ctx: CmsContext, ...a: any[]) => any ? K : never]: Bound<M[K]> };

function bind<M extends Record<string, any>>(ctx: CmsContext, mod: M): BindAll<M> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(mod)) if (typeof v === "function") out[k] = (...a: unknown[]) => v(ctx, ...a);
  return out as BindAll<M>;
}

async function stats(ctx: CmsContext) {
  const p = ctx.t.pages;
  const rows = await ctx.db
    .select({ collection: p.type, status: p.status, n: sql<number>`count(*)` })
    .from(p)
    .where(isNull(p.deletedAt))
    .groupBy(p.type, p.status);
  const byCollection: Record<string, Record<string, number>> = {};
  let total = 0;
  for (const r of rows) {
    (byCollection[r.collection] ??= {})[r.status] = Number(r.n);
    total += Number(r.n);
  }
  const [pendingReviews] = await ctx.db
    .select({ n: sql<number>`count(*)` })
    .from(ctx.t.pageVersions)
    .where(eq(ctx.t.pageVersions.status, "pending"));
  const [scheduled] = await ctx.db
    .select({ n: sql<number>`count(*)` })
    .from(p)
    .where(and(isNull(p.deletedAt), sql`${p.scheduledAt} is not null`));
  return {
    totalEntries: total,
    byCollection,
    pendingReviews: Number(pendingReviews?.n ?? 0),
    scheduled: Number(scheduled?.n ?? 0),
  };
}

/**
 * The CMS API, bound to one database. The HTTP router, MCP server, cron handler, loaders and
 * any app code all go through this — there is no other path to the CMS tables.
 *
 * @example
 *   const cms = createCms({ db, dialect: "pg", collections });
 *   const posts = await cms.entries.listEntries({ collection: "blog", status: "published" });
 */
export function createCms(input: CmsContextInput | CmsContext) {
  const ctx = "t" in input ? input : createCmsContext(input);
  return {
    ctx,
    collections: bind(ctx, collections),
    entries: bind(ctx, entries),
    templates: bind(ctx, templates),
    taxonomies: bind(ctx, taxonomies),
    bylines: bind(ctx, bylines),
    search: bind(ctx, search),
    settings: bind(ctx, settings),
    stats: () => stats(ctx),
  };
}

export type Cms = ReturnType<typeof createCms>;
export type { CmsActor };
