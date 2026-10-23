import { SQLITE_CMS_MIGRATIONS, PG_CMS_MIGRATIONS } from "./sql";

export interface MigrationResult {
  applied: string[];
  skipped: string[];
  dialect: "sqlite" | "pg";
}

/**
 * Checks if target db instance is a Cloudflare D1 database or SQLite Drizzle client.
 */
function isSQLiteOrD1(db: any): boolean {
  if (!db) return false;
  // Cloudflare D1 binding: has prepare(), batch(), dump(), exec()
  if (typeof db.prepare === "function" && typeof db.batch === "function") {
    return true;
  }
  // Drizzle SQLite instance
  if (db.session?.client?.prepare || db._?.dialect === "sqlite" || db.dialect === "sqlite") {
    return true;
  }
  return false;
}

/**
 * Executes migrations for Rimelight CMS against the provided database.
 * Supports Cloudflare D1 bindings, Drizzle SQLite/D1 instances, and PostgreSQL/Neon clients.
 */
export async function migrateCms(db: any): Promise<MigrationResult> {
  if (!db) {
    throw new Error("[@rimelight/cms migrator] No database instance provided to migrateCms().");
  }

  const isD1Binding = typeof db.prepare === "function" && typeof db.batch === "function";
  const isSqlite = isSQLiteOrD1(db);

  if (isD1Binding) {
    return runD1Migrations(db);
  }

  if (isSqlite) {
    // Drizzle SQLite
    return runDrizzleSqliteMigrations(db);
  }

  // Neon / Postgres
  return runPostgresMigrations(db);
}

/**
 * Runs migrations on a native Cloudflare D1 binding.
 */
async function runD1Migrations(d1: any): Promise<MigrationResult> {
  const applied: string[] = [];
  const skipped: string[] = [];

  // Ensure tracking table exists
  await d1
    .prepare(
      `CREATE TABLE IF NOT EXISTS _rimelight_cms_migrations (
        id text PRIMARY KEY,
        name text NOT NULL,
        applied_at integer NOT NULL
      )`,
    )
    .run();

  const executedRows = await d1.prepare(`SELECT name FROM _rimelight_cms_migrations`).all();

  const executedSet = new Set<string>(
    (executedRows?.results || []).map((r: any) => String(r.name)),
  );

  for (const m of SQLITE_CMS_MIGRATIONS) {
    if (executedSet.has(m.name)) {
      skipped.push(m.name);
      continue;
    }

    const statements = m.sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const batch = statements.map((stmt) => d1.prepare(stmt));
    batch.push(
      d1
        .prepare(`INSERT INTO _rimelight_cms_migrations (id, name, applied_at) VALUES (?, ?, ?)`)
        .bind(crypto.randomUUID(), m.name, Date.now()),
    );

    await d1.batch(batch);
    applied.push(m.name);
  }

  return { applied, skipped, dialect: "sqlite" };
}

/**
 * Runs migrations on a Drizzle SQLite instance.
 */
async function runDrizzleSqliteMigrations(db: any): Promise<MigrationResult> {
  const { sql } = await import("drizzle-orm");
  const applied: string[] = [];
  const skipped: string[] = [];

  await db.run(
    sql`CREATE TABLE IF NOT EXISTS \`_rimelight_cms_migrations\` (
      \`id\` text PRIMARY KEY,
      \`name\` text NOT NULL,
      \`applied_at\` integer NOT NULL
    )`,
  );

  const executedRows = await db.all(sql`SELECT \`name\` FROM \`_rimelight_cms_migrations\``);

  const executedSet = new Set<string>((executedRows || []).map((r: any) => String(r.name)));

  for (const m of SQLITE_CMS_MIGRATIONS) {
    if (executedSet.has(m.name)) {
      skipped.push(m.name);
      continue;
    }

    const statements = m.sql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      await db.run(sql.raw(stmt));
    }

    const id = crypto.randomUUID();
    const now = Date.now();
    await db.run(
      sql`INSERT INTO \`_rimelight_cms_migrations\` (\`id\`, \`name\`, \`applied_at\`) VALUES (${id}, ${m.name}, ${now})`,
    );

    applied.push(m.name);
  }

  return { applied, skipped, dialect: "sqlite" };
}

/**
 * Runs migrations on a Postgres client or Drizzle Postgres instance.
 */
async function runPostgresMigrations(db: any): Promise<MigrationResult> {
  const { sql } = await import("drizzle-orm");
  const applied: string[] = [];
  const skipped: string[] = [];

  // Check if raw Neon or Drizzle
  const isDrizzle = typeof db.execute === "function";

  if (isDrizzle) {
    await db.execute(
      sql`CREATE TABLE IF NOT EXISTS "_rimelight_cms_migrations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "applied_at" timestamp with time zone DEFAULT now() NOT NULL
      )`,
    );

    const executedRows: any = await db.execute(sql`SELECT "name" FROM "_rimelight_cms_migrations"`);

    const rows = Array.isArray(executedRows) ? executedRows : executedRows?.rows || [];
    const executedSet = new Set<string>(rows.map((r: any) => String(r.name)));

    for (const m of PG_CMS_MIGRATIONS) {
      if (executedSet.has(m.name)) {
        skipped.push(m.name);
        continue;
      }

      const statements = m.sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await db.execute(sql.raw(stmt));
      }

      await db.execute(sql`INSERT INTO "_rimelight_cms_migrations" ("name") VALUES (${m.name})`);
      applied.push(m.name);
    }
  } else if (typeof db === "function") {
    // raw neon sql tagged template or query function
    await db`CREATE TABLE IF NOT EXISTS "_rimelight_cms_migrations" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text NOT NULL,
      "applied_at" timestamp with time zone DEFAULT now() NOT NULL
    )`;

    const executedRows = await db`SELECT "name" FROM "_rimelight_cms_migrations"`;
    const executedSet = new Set<string>((executedRows || []).map((r: any) => String(r.name)));

    for (const m of PG_CMS_MIGRATIONS) {
      if (executedSet.has(m.name)) {
        skipped.push(m.name);
        continue;
      }

      const statements = m.sql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await db(stmt);
      }

      await db`INSERT INTO "_rimelight_cms_migrations" ("name") VALUES (${m.name})`;
      applied.push(m.name);
    }
  }

  return { applied, skipped, dialect: "pg" };
}
