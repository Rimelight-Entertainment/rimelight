import { describe, expect, it } from "vite-plus/test";
import { getTableColumns, getTableName } from "drizzle-orm";
import * as pgSchema from "../src/schema/index";
import * as sqliteSchema from "../src/schema/sqlite";
import { migrateCms } from "../src/migrator/index";
import { createMockD1 } from "./helpers/d1";

/** Table name → sorted column names, for every table a schema module exports. */
function shape(mod: Record<string, unknown>): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const value of Object.values(mod)) {
    if (!value || typeof value !== "object") continue;
    let name: string;
    try {
      name = getTableName(value as any);
    } catch {
      continue; // not a table (relations, helpers)
    }
    const columns = Object.values(getTableColumns(value as any)).map((c: any) => c.name as string);
    out.set(
      name,
      columns.sort((a, b) => a.localeCompare(b)),
    );
  }
  return out;
}

describe("schema parity", () => {
  const pg = shape(pgSchema);
  const sqlite = shape(sqliteSchema);

  it("declares the same tables in the pg and sqlite schemas", () => {
    expect([...sqlite.keys()].sort()).toEqual([...pg.keys()].sort());
  });

  it("declares the same columns for every table in the pg and sqlite schemas", () => {
    // Deliberate differences: Postgres full-text search uses a tsvector column; SQLite has no
    // equivalent and searches the content_search_index table without it.
    const intentionalPgOnly: Record<string, string[]> = {
      content_search_index: ["search_vector"],
    };
    const drift: Record<string, { pgOnly: string[]; sqliteOnly: string[] }> = {};
    for (const [table, cols] of pg) {
      const other = sqlite.get(table) ?? [];
      const allowed = intentionalPgOnly[table] ?? [];
      const pgOnly = cols.filter((c) => !other.includes(c) && !allowed.includes(c));
      const sqliteOnly = other.filter((c) => !cols.includes(c));
      if (pgOnly.length || sqliteOnly.length) drift[table] = { pgOnly, sqliteOnly };
    }
    expect(drift).toEqual({});
  });

  it("migrates a fresh database to exactly the columns the sqlite schema declares", async () => {
    const { binding, raw } = createMockD1();
    await migrateCms(binding);
    const actual = new Map<string, string[]>();
    for (const { name } of raw
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as any[]) {
      if (name.startsWith("_") || name.startsWith("sqlite_")) continue;
      const cols = (raw.prepare(`PRAGMA table_info("${name}")`).all() as any[]).map((c) => c.name);
      actual.set(
        name,
        cols.sort((a, b) => a.localeCompare(b)),
      );
    }
    const drift: Record<string, { declared: string[]; migrated: string[] }> = {};
    for (const [table, declared] of sqlite) {
      const migrated = actual.get(table) ?? [];
      if (JSON.stringify(declared) !== JSON.stringify(migrated))
        drift[table] = { declared, migrated };
    }
    expect(drift).toEqual({});
  });
});
