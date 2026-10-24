import { DatabaseSync } from "node:sqlite";

/**
 * In-memory SQLite exposed through the Cloudflare D1 binding interface, so tests exercise the
 * exact code path production uses on Workers (D1 binding → drizzle-orm/d1).
 */
export function createMockD1() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys = ON");

  const statement = (query: string, bindings: any[] = []) => ({
    bind(...args: any[]) {
      return statement(query, args);
    },
    async all() {
      return { results: db.prepare(query).all(...bindings), success: true };
    },
    async run() {
      const info = db.prepare(query).run(...bindings);
      return {
        success: true,
        meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) },
      };
    },
    async first(col?: string) {
      const row = db.prepare(query).get(...bindings) as any;
      if (!row) return null;
      return col ? row[col] : row;
    },
    async raw() {
      const stmt = db.prepare(query);
      return (stmt.all(...bindings) as any[]).map((r) => Object.values(r));
    },
  });

  const binding = {
    prepare: (query: string) => statement(query),
    async batch(statements: any[]) {
      db.exec("BEGIN");
      try {
        const out = [];
        for (const s of statements) out.push(await s.all());
        db.exec("COMMIT");
        return out;
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    },
    async exec(query: string) {
      db.exec(query);
      return { count: 0, duration: 0 };
    },
    dump: async () => new ArrayBuffer(0),
  };

  return { raw: db, binding };
}
