import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import * as pgTables from "../schema/index";
import * as sqliteTables from "../schema/sqlite";

export type Dialect = "pg" | "sqlite";

export interface CmsDbInstance {
  db: any;
  dialect: Dialect;
  tables: CmsTables;
}

export interface ResolveDbOptions {
  db?: any;
  env?: any;
}

// Cache instances weakly by binding/context/options object to avoid re-instantiating per request
const dbCache = new WeakMap<object, CmsDbInstance>();

/**
 * Checks if target instance is a Cloudflare D1 binding or a SQLite Drizzle client.
 */
export function isD1Binding(val: any): boolean {
  return (
    val !== null &&
    typeof val === "object" &&
    typeof val.prepare === "function" &&
    typeof val.batch === "function"
  );
}

export function isSQLiteOrD1(val: any): boolean {
  if (!val) return false;
  if (isD1Binding(val)) return true;
  // Drizzle SQLite instance
  if (
    val.session?.client?.prepare ||
    val._?.dialect === "sqlite" ||
    val.dialect === "sqlite" ||
    val.session?.type === "sqlite"
  ) {
    return true;
  }
  return false;
}

export function detectDialect(val: any): Dialect {
  return isSQLiteOrD1(val) ? "sqlite" : "pg";
}

/** Tables for a dialect. Both modules export identical table names and column keys. */
export type CmsTables = typeof pgTables;
export function tablesFor(dialect: Dialect): CmsTables {
  return (dialect === "sqlite" ? sqliteTables : pgTables) as unknown as CmsTables;
}

/**
 * Custom fetch-based Neon SQL query client that runs cleanly inside Cloudflare Workers / Miniflare
 * without triggering workerd driver internal errors.
 */
function createWorkerNeonSql(connectionString: string) {
  const cleanUrl = connectionString
    .trim()
    .replace(/([?&])channel_binding=[^&]*(&|$)/g, "$1")
    .replace(/[?&]$/, "");
  const host = new URL(cleanUrl).host;
  const endpoint = `https://${host}/sql`;

  const queryFn: any = async (query: string, params: any[] = []) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": cleanUrl,
        "Neon-Raw-Text-Output": "true",
        "Neon-Array-Mode": "true",
      },
      body: JSON.stringify({ query, params }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Neon HTTP error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    return data;
  };

  queryFn.query = queryFn;
  return queryFn;
}

/**
 * Resolves a unified database client and dialect-matching schema tables.
 *
 * Checks in order:
 * 1. Explicit `options.db` (if already a Drizzle instance or D1 binding)
 * 2. `c.env.DB` (Cloudflare D1 binding in Worker context)
 * 3. Connection string in env: HYPERDRIVE.connectionString, HYPERDRIVE_URL, DATABASE_URL
 * 4. globalThis.__rimelight_db
 */
export function getCmsDb(options: ResolveDbOptions = {}, c?: any): CmsDbInstance {
  // If we already have a cached instance for this request context or options object, return it
  const cacheKey =
    (c && typeof c === "object" ? c : null) ||
    (options && typeof options === "object" ? options : null);
  if (cacheKey && dbCache.has(cacheKey)) {
    return dbCache.get(cacheKey)!;
  }

  let rawDb = options.db;
  const env = c?.env || options.env;

  if (!rawDb && env?.DB) {
    rawDb = env.DB;
  }

  if (!rawDb) {
    const isDev =
      (typeof process !== "undefined" && process.env?.["NODE_ENV"] === "development") ||
      (typeof import.meta !== "undefined" && Boolean((import.meta as any).env?.DEV)) ||
      Boolean(env?.DATABASE_URL && env?.HYPERDRIVE?.host?.includes(".hyperdrive.local"));

    // In local dev, Cloudflare Hyperdrive proxy binds to a mock local IP that the Neon serverless HTTP driver
    // cannot reach over HTTP. Prefer direct DATABASE_URL in dev mode or whenever Hyperdrive is pointing to a local mock.
    const envUrl = isDev
      ? env?.DATABASE_URL ||
        env?.HYPERDRIVE?.connectionString ||
        env?.HYPERDRIVE_URL ||
        (typeof process !== "undefined"
          ? process.env?.["DATABASE_URL"] || process.env?.["HYPERDRIVE_URL"]
          : undefined) ||
        (typeof import.meta !== "undefined"
          ? (import.meta as any).env?.["DATABASE_URL"] ||
            (import.meta as any).env?.["HYPERDRIVE_URL"]
          : undefined)
      : env?.HYPERDRIVE?.connectionString ||
        env?.HYPERDRIVE_URL ||
        env?.DATABASE_URL ||
        (typeof process !== "undefined"
          ? process.env?.["HYPERDRIVE_URL"] || process.env?.["DATABASE_URL"]
          : undefined) ||
        (typeof import.meta !== "undefined"
          ? (import.meta as any).env?.["HYPERDRIVE_URL"] ||
            (import.meta as any).env?.["DATABASE_URL"]
          : undefined);

    if (typeof envUrl === "string" && envUrl.trim().length > 0) {
      const client = createWorkerNeonSql(envUrl);
      const db = drizzleNeonHttp({ client } as any);
      const instance: CmsDbInstance = {
        db,
        dialect: "pg",
        tables: tablesFor("pg"),
      };
      if (cacheKey) dbCache.set(cacheKey, instance);
      return instance;
    }
  }

  if (!rawDb && typeof (globalThis as any).__rimelight_db !== "undefined") {
    rawDb = (globalThis as any).__rimelight_db;
  }

  if (!rawDb) {
    throw new Error(
      "[@rimelight/cms] No database instance found. Please configure `DATABASE_URL`, a `db` option, or a `DB` D1 binding.",
    );
  }

  // Determine dialect and wrap with Drizzle if it's a raw binding
  if (isD1Binding(rawDb)) {
    const db = drizzleD1(rawDb);
    const instance: CmsDbInstance = {
      db,
      dialect: "sqlite",
      tables: tablesFor("sqlite"),
    };
    if (cacheKey) dbCache.set(cacheKey, instance);
    return instance;
  }

  const dialect: Dialect = isSQLiteOrD1(rawDb) ? "sqlite" : "pg";
  const instance: CmsDbInstance = {
    db: rawDb,
    dialect,
    tables: tablesFor(dialect),
  };

  if (cacheKey) dbCache.set(cacheKey, instance);
  return instance;
}
