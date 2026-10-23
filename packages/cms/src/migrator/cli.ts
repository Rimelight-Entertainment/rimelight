#!/usr/bin/env node
import { migrateCms } from "./index";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "migrate";

  if (command !== "migrate") {
    console.log(`Usage: rimelight-cms migrate`);
    process.exit(1);
  }

  console.log("[@rimelight/cms] Resolving database connection...");

  let db: any = null;

  // Check DATABASE_URL or HYPERDRIVE_URL
  const connStr = process.env["HYPERDRIVE_URL"] || process.env["DATABASE_URL"];

  if (connStr) {
    if (connStr.startsWith("postgres://") || connStr.startsWith("postgresql://")) {
      const { neon } = await import("@neondatabase/serverless");
      const { drizzle } = await import("drizzle-orm/neon-http");
      db = drizzle({ client: neon(connStr) });
    }
  }

  if (!db) {
    // Attempt to load from user's #db or src/db
    try {
      const cwd = process.cwd();
      const localDb = await import(`${cwd}/src/db/index.ts`);
      db = localDb.db;
    } catch {}
  }

  if (!db) {
    console.error(
      "[@rimelight/cms] Could not detect database. Please set DATABASE_URL or run within a project exporting `db` from src/db/index.ts",
    );
    process.exit(1);
  }

  try {
    const result = await migrateCms(db);
    console.log(
      `[@rimelight/cms] Migrations complete (${result.dialect}). Applied: ${result.applied.length}, Skipped: ${result.skipped.length}`,
    );
    if (result.applied.length > 0) {
      console.log(`[@rimelight/cms] Applied migrations: ${result.applied.join(", ")}`);
    }
  } catch (err: any) {
    console.error("[@rimelight/cms] Migration failed:", err);
    process.exit(1);
  }
}

void main();
