import { drizzle as drizzleD1 } from "drizzle-orm/d1";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as pgTables from "../schema/index";
import * as sqliteTables from "../schema/sqlite";

export type Dialect = "pg" | "sqlite";

export interface CmsDbInstance {
  db: any;
  dialect: Dialect;
  tables: typeof pgTables | typeof sqliteTables;
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
    const envUrl =
      env?.HYPERDRIVE?.connectionString ||
      env?.HYPERDRIVE_URL ||
      env?.DATABASE_URL ||
      (typeof process !== "undefined"
        ? process.env?.["HYPERDRIVE_URL"] || process.env?.["DATABASE_URL"]
        : undefined) ||
      (typeof import.meta !== "undefined"
        ? (import.meta as any).env?.["HYPERDRIVE_URL"] || (import.meta as any).env?.["DATABASE_URL"]
        : undefined);

    if (typeof envUrl === "string" && envUrl.trim().length > 0) {
      const client = neon(envUrl.trim());
      const db = drizzleNeonHttp({ client } as any);
      const instance: CmsDbInstance = {
        db,
        dialect: "pg",
        tables: pgTables,
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
      tables: sqliteTables,
    };
    if (cacheKey) dbCache.set(cacheKey, instance);
    return instance;
  }

  const dialect: Dialect = isSQLiteOrD1(rawDb) ? "sqlite" : "pg";
  const instance: CmsDbInstance = {
    db: rawDb,
    dialect,
    tables: dialect === "sqlite" ? sqliteTables : pgTables,
  };

  if (cacheKey) dbCache.set(cacheKey, instance);
  return instance;
}
