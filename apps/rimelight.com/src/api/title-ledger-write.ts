import { and, eq } from "drizzle-orm";
import type { PgAsyncTransaction } from "drizzle-orm/pg-core";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { relations as dbRelations } from "#db/schema/relations";
import { titleCurrencies } from "#db/schema/title-currencies";
import { titleItems } from "#db/schema/title-items";
import { titleLedgerEntries } from "#db/schema/title-ledger";
import { t } from "@rimelight/i18n";
import { planLedger, type NetLedgerChange } from "./title-ledger";

/** The transaction handle the ledger writes through: a Drizzle transaction over the app's relations. */
export type LedgerTx = PgAsyncTransaction<PostgresJsQueryResultHKT, typeof dbRelations>;

/** A batch the ledger refuses. Thrown inside a transaction, so the batch row and every write before it are rolled back. */
export class LedgerRefusal extends Error {}

/**
 * Writes one batch's changes inside the caller's transaction, after the batch row is recorded under `batchId`. It locks every
 * currency and item the batch touches, creating any that do not exist yet, so the amounts planned are the amounts written. The
 * caller must have checked that every id has a cap. A batch the caps refuse throws LedgerRefusal and writes nothing. Returns each
 * touched id's balance after the batch.
 */
export async function writeLedgerChanges(
  tx: LedgerTx,
  userId: string,
  title: string,
  batchId: string,
  net: Map<string, NetLedgerChange>,
  caps: Record<string, number>,
): Promise<Map<string, number>> {
  // Lock every row the batch touches, creating any that do not exist yet, so the amounts read are the amounts written.
  const current = new Map<string, number>();
  for (const [id, change] of net) {
    if (change.kind === "currency") {
      await tx
        .insert(titleCurrencies)
        .values({ userId, title, currencyId: id })
        .onConflictDoNothing();
      const [row] = await tx
        .select()
        .from(titleCurrencies)
        .where(
          and(
            eq(titleCurrencies.userId, userId),
            eq(titleCurrencies.title, title),
            eq(titleCurrencies.currencyId, id),
          ),
        )
        .for("update");
      current.set(id, row!.amount);
    } else {
      await tx.insert(titleItems).values({ userId, title, itemId: id }).onConflictDoNothing();
      const [row] = await tx
        .select()
        .from(titleItems)
        .where(
          and(
            eq(titleItems.userId, userId),
            eq(titleItems.title, title),
            eq(titleItems.itemId, id),
          ),
        )
        .for("update");
      current.set(id, row!.amount);
    }
  }

  // The batch's net change per id is what the caps judge: entries for one id add up before the check.
  const plan = planLedger(
    current,
    [...net].map(([id, change]) => ({ id, delta: change.delta })),
    caps,
  );
  if (!plan.ok) {
    throw new LedgerRefusal(
      plan.reason === "over-cap" ? t("api.message.ledger-over-cap") : t("api.message.ledger-short"),
    );
  }

  await tx.insert(titleLedgerEntries).values(
    [...net].map(([id, change]) => ({
      batchId,
      kind: change.kind,
      itemId: id,
      delta: change.delta,
      reason: change.reason,
      balanceAfter: plan.next.get(id)!,
    })),
  );

  for (const [id, amount] of plan.next) {
    if (net.get(id)!.kind === "currency") {
      await tx
        .update(titleCurrencies)
        .set({ amount, updatedAt: new Date() })
        .where(
          and(
            eq(titleCurrencies.userId, userId),
            eq(titleCurrencies.title, title),
            eq(titleCurrencies.currencyId, id),
          ),
        );
    } else {
      await tx
        .update(titleItems)
        .set({ amount, updatedAt: new Date() })
        .where(
          and(
            eq(titleItems.userId, userId),
            eq(titleItems.title, title),
            eq(titleItems.itemId, id),
          ),
        );
    }
  }
  return plan.next;
}
