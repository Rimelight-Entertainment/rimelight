import { sql } from "drizzle-orm";
import { PG_CMS_MIGRATIONS, SQLITE_CMS_MIGRATIONS } from "./sql";
import { DATA_MIGRATIONS } from "./data";
import { detectDialect, isD1Binding } from "../db/index";

export interface MigrationResult {
  applied: string[];
  skipped: string[];
  dialect: "sqlite" | "pg";
}

interface Migration {
  name: string;
  sql: string;
}

/**
 * Minimal statement executor so a single runner works for every supported driver:
 * Cloudflare D1 bindings, Drizzle SQLite/D1 instances, Drizzle Postgres instances, and raw
 * `neon()` query functions.
 */
interface Executor {
  dialect: "sqlite" | "pg";
  run(statement: string): Promise<void>;
  record(name: string): Promise<void>;
  names(): Promise<string[]>;
}

const splitStatements = (source: string) =>
  source
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);

/** SQLite has no `ADD COLUMN IF NOT EXISTS`; treat an already-present column as applied. */
const isIgnorableSqliteError = (err: unknown) =>
  /duplicate column name/i.test(String((err as any)?.message ?? err));

function createExecutor(db: any): Executor {
  if (isD1Binding(db)) {
    return {
      dialect: "sqlite",
      async run(statement) {
        await db.prepare(statement).run();
      },
      async record(name) {
        await db
          .prepare(`INSERT INTO _rimelight_cms_migrations (id, name, applied_at) VALUES (?, ?, ?)`)
          .bind(crypto.randomUUID(), name, Date.now())
          .run();
      },
      async names() {
        const rows = await db.prepare(`SELECT name FROM _rimelight_cms_migrations`).all();
        return (rows?.results ?? []).map((r: any) => String(r.name));
      },
    };
  }

  const dialect = detectDialect(db);

  if (dialect === "sqlite") {
    return {
      dialect,
      async run(statement) {
        await db.run(sql.raw(statement));
      },
      async record(name) {
        await db.run(
          sql`INSERT INTO _rimelight_cms_migrations (id, name, applied_at) VALUES (${crypto.randomUUID()}, ${name}, ${Date.now()})`,
        );
      },
      async names() {
        const rows = await db.all(sql`SELECT name FROM _rimelight_cms_migrations`);
        return (rows ?? []).map((r: any) => String(r.name));
      },
    };
  }

  // Postgres: Drizzle instance or raw neon() function.
  const exec = async (statement: string, params: unknown[] = []) => {
    if (typeof db.execute === "function") {
      return params.length
        ? db.execute(sql`INSERT INTO "_rimelight_cms_migrations" ("name") VALUES (${params[0]})`)
        : db.execute(sql.raw(statement));
    }
    if (typeof db.query === "function") return db.query(statement, params);
    return db(statement, params);
  };

  return {
    dialect: "pg",
    async run(statement) {
      await exec(statement);
    },
    async record(name) {
      await exec(`INSERT INTO "_rimelight_cms_migrations" ("name") VALUES ($1)`, [name]);
    },
    async names() {
      const res: any = await exec(`SELECT "name" FROM "_rimelight_cms_migrations"`);
      const rows = Array.isArray(res) ? res : (res?.rows ?? []);
      return rows.map((r: any) => String(r.name ?? r[0]));
    },
  };
}

const TRACKING_TABLE = {
  sqlite: `CREATE TABLE IF NOT EXISTS _rimelight_cms_migrations (id text PRIMARY KEY, name text NOT NULL, applied_at integer NOT NULL)`,
  pg: `CREATE TABLE IF NOT EXISTS "_rimelight_cms_migrations" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" text NOT NULL, "applied_at" timestamp with time zone DEFAULT now() NOT NULL)`,
};

/**
 * Applies pending Rimelight CMS migrations. Safe to call on every cold start: migrations are
 * tracked in `_rimelight_cms_migrations` and every statement is additive.
 */
export async function migrateCms(db: any): Promise<MigrationResult> {
  if (!db)
    throw new Error("[@rimelight/cms migrator] No database instance provided to migrateCms().");

  const executor = createExecutor(db);
  const migrations: Migration[] =
    executor.dialect === "sqlite" ? SQLITE_CMS_MIGRATIONS : PG_CMS_MIGRATIONS;

  await executor.run(TRACKING_TABLE[executor.dialect]);
  const done = new Set(await executor.names());

  const applied: string[] = [];
  const skipped: string[] = [];

  for (const migration of migrations) {
    if (done.has(migration.name)) {
      skipped.push(migration.name);
      continue;
    }
    for (const statement of splitStatements(migration.sql)) {
      try {
        await executor.run(statement);
      } catch (err) {
        if (executor.dialect === "sqlite" && isIgnorableSqliteError(err)) continue;
        throw new Error(
          `[@rimelight/cms migrator] ${migration.name} failed on:\n${statement}\n${String((err as any)?.message ?? err)}`,
        );
      }
    }
    await executor.record(migration.name);
    applied.push(migration.name);
  }

  // Data migrations rewrite stored JSON into current shapes (run after the schema exists).
  for (const migration of DATA_MIGRATIONS) {
    if (done.has(migration.name)) {
      skipped.push(migration.name);
      continue;
    }
    await migration.run(db);
    await executor.record(migration.name);
    applied.push(migration.name);
  }

  return { applied, skipped, dialect: executor.dialect };
}
