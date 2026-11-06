import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { users } from "#db/schema/users";
import type { LedgerTx } from "../../title-ledger-write";

/**
 * The player a game server writes for, named in the request body. The game server resolves it from the player's own session,
 * so it is a Rimelight user id. Lowercased to match the ids the database holds.
 */
export const serverPlayerSchema = z
  .string()
  .uuid()
  .transform((value) => value.toLowerCase());

/** Whether a player account exists and has not been deleted. Takes the database or a transaction. */
export async function playerExists(db: Pick<LedgerTx, "select">, userId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), isNull(users.deletedAt)));
  return row !== undefined;
}
