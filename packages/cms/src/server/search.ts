import { Hono } from "hono";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { sql, desc, or, like } from "drizzle-orm";
import { searchIndex as defaultSearchIndex } from "../schema";

export interface SearchRouterOptions {
  prefix?: string | undefined;
  db?: any;
  schema?: {
    searchIndex?: any;
  };
}

export function createSearchRouter(options: SearchRouterOptions = {}) {
  const search = new Hono();
  if (options.prefix) {
    search.basePath(options.prefix);
  }

  let resolvedDb: any = null;
  const getDb = async (c?: any) => {
    if (resolvedDb) return resolvedDb;
    if (options.db) {
      resolvedDb = options.db;
      return resolvedDb;
    }
    if (c?.env?.DB) {
      resolvedDb = c.env.DB;
      return resolvedDb;
    }
    const envUrl =
      c?.env?.HYPERDRIVE?.connectionString ||
      c?.env?.HYPERDRIVE_URL ||
      c?.env?.DATABASE_URL ||
      (typeof process !== "undefined"
        ? process.env?.["HYPERDRIVE_URL"] || process.env?.["DATABASE_URL"]
        : undefined) ||
      (typeof import.meta !== "undefined"
        ? (import.meta as any).env?.["HYPERDRIVE_URL"] || (import.meta as any).env?.["DATABASE_URL"]
        : undefined);
    if (typeof envUrl === "string" && envUrl.trim().length > 0) {
      resolvedDb = drizzle({ client: neon(envUrl.trim()) });
      return resolvedDb;
    }
    if (typeof (globalThis as any).__rimelight_db !== "undefined") {
      resolvedDb = (globalThis as any).__rimelight_db;
      return resolvedDb;
    }
    throw new Error("[@rimelight/cms Search Router] No database instance found.");
  };

  const searchIndex = options.schema?.searchIndex || defaultSearchIndex;

  search.get("/", async (c) => {
    const q = c.req.query("q") || "";

    if (!q.trim()) {
      return c.json([]);
    }

    try {
      const db = await getDb(c);
      const cleanQuery = q.trim().replace(/[!|&()*]/g, "");
      const terms = cleanQuery.split(/\s+/).filter(Boolean);
      const formattedQuery = terms.map((t) => `${t}:*`).join(" & ");

      let results: any[] = [];
      try {
        const querySql = formattedQuery
          ? sql`to_tsquery('english', ${formattedQuery})`
          : sql`websearch_to_tsquery('english', ${q})`;

        results = await db
          .select({
            title: searchIndex.title,
            url: searchIndex.url,
            sourceType: searchIndex.sourceType,
            rank: sql<number>`ts_rank(${searchIndex.searchableText}, ${querySql})`,
            snippet: sql<string>`ts_headline('english', ${searchIndex.bodyContent}, ${querySql}, 'StartSel=<mark>, StopSel=</mark>, MaxWords=20')`,
          })
          .from(searchIndex)
          .where(
            sql`${searchIndex.searchableText} @@ ${querySql} or ${searchIndex.title} ilike ${`%${q}%`}`,
          )
          .orderBy(
            desc(sql`ts_rank(${searchIndex.searchableText}, ${querySql})`),
            desc(searchIndex.updatedAt),
          )
          .limit(10);
      } catch (dbErr: any) {
        // Fallback for SQLite or environments without PostgreSQL tsvector / ts_headline
        results = await db
          .select({
            title: searchIndex.title,
            url: searchIndex.url,
            sourceType: searchIndex.sourceType,
            snippet: searchIndex.bodyContent,
          })
          .from(searchIndex)
          .where(or(like(searchIndex.title, `%${q}%`), like(searchIndex.bodyContent, `%${q}%`)))
          .orderBy(desc(searchIndex.updatedAt))
          .limit(10);
      }

      return c.json(results);
    } catch (error: any) {
      console.error("[@rimelight/cms Search Router Error]:", error);
      return c.json({ error: error.message }, 500);
    }
  });

  return search;
}

export const searchRouter: Hono = createSearchRouter();
