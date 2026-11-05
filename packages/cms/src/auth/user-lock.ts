import { sql } from "drizzle-orm";
import type { Dialect } from "../db/index";

/**
 * Serialises CMS account writes that check state and then write (the last-admin guard and the
 * first-account bootstrap). On Postgres this runs `fn` in a transaction holding a transaction-scoped
 * advisory lock, so concurrent requests queue behind each other. D1 cannot run transactions and
 * already serialises writes per database, so there `fn` runs directly and callers must make each
 * guard a single conditional statement.
 */
export async function withUserLock<T>(
  db: any,
  dialect: Dialect,
  fn: (conn: any) => Promise<T>,
): Promise<T> {
  if (dialect === "sqlite") return fn(db);
  return db.transaction(async (tx: any) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('cms_users'))`);
    return fn(tx);
  });
}
