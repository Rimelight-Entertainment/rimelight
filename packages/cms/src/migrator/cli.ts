#!/usr/bin/env node
import { migrateCms, collectionPreflight, type CollectionPreflight } from "./index";

const USAGE = `Usage: rimelight-cms <migrate|check> [--strict]
  migrate  Apply pending migrations, then report collection references.
  check    Read-only: report collection references without migrating.
  --strict Exit 1 if anything content depends on is missing (collections, taxonomies, templates).`;

function printPreflight(report: CollectionPreflight) {
  console.log(
    `[@rimelight/cms] ${report.dialect}: ${report.inDatabase.length} collections in use are defined, ` +
      `${report.missing.length} missing, ${report.missingTaxonomies.length} taxonomies missing, ` +
      `${report.orphanTemplates.length} orphan templates`,
  );
  for (const r of report.missing) {
    const hint = r.preset ? ` (preset "${r.preset}" can scaffold it)` : "";
    console.warn(`[@rimelight/cms]   MISSING collection ${r.slug}: ${r.entries} entries${hint}`);
  }
  for (const t of report.missingTaxonomies) {
    const hint = t.preset ? ` (preset "${t.preset}" can scaffold it)` : "";
    console.warn(`[@rimelight/cms]   MISSING taxonomy ${t.slug}: used ${t.uses} times${hint}`);
  }
  for (const t of report.orphanTemplates) {
    console.warn(
      `[@rimelight/cms]   ORPHAN template ${t.slug}: collection "${t.collection}" does not exist`,
    );
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "migrate";
  const strict = args.includes("--strict");

  if (command !== "migrate" && command !== "check") {
    console.log(USAGE);
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
    if (command === "migrate") {
      const result = await migrateCms(db);
      console.log(
        `[@rimelight/cms] Migrations complete (${result.dialect}). Applied: ${result.applied.length}, Skipped: ${result.skipped.length}`,
      );
      if (result.applied.length > 0) {
        console.log(`[@rimelight/cms] Applied migrations: ${result.applied.join(", ")}`);
      }
    }

    const report = await collectionPreflight(db);
    printPreflight(report);
    const gaps =
      report.missing.length + report.missingTaxonomies.length + report.orphanTemplates.length;
    if (strict && gaps > 0) process.exit(1);
  } catch (err: any) {
    console.error(`[@rimelight/cms] ${command} failed:`, err);
    process.exit(1);
  }
}

void main();
