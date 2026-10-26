import { eq } from "drizzle-orm";
import { getDb } from "#db";
import { users } from "#db/schema/users";

export class ProvisionConflictError extends Error {}

type Db = ReturnType<typeof getDb>;
type UserRow = typeof users.$inferSelect;

/**
 * Finds or creates the `users` row for an Auth0 subject. Does not use `syncAuth0UserToDb`, which
 * merges accounts by email. Here an email match with a different or null `auth0_id` is a conflict.
 */
export async function provisionUser(
  db: Db,
  claims: { sub: string; email: string },
  attempt = 0,
): Promise<UserRow> {
  const [bySub] = await db.select().from(users).where(eq(users.auth0Id, claims.sub)).limit(1);
  if (bySub) return bySub;

  const [byEmail] = await db.select().from(users).where(eq(users.email, claims.email)).limit(1);
  if (byEmail) {
    throw new ProvisionConflictError("An account with this email is already linked.");
  }

  try {
    await db
      .insert(users)
      .values({
        auth0Id: claims.sub,
        email: claims.email,
        name: claims.email.split("@")[0] || "Player",
        tag: "0000",
        emailVerified: true,
      })
      .onConflictDoNothing({ target: users.auth0Id });
  } catch (err) {
    // A concurrent first call inserted the same email. Retry once from the lookup.
    if (attempt === 0) return provisionUser(db, claims, 1);
    throw err;
  }

  const [created] = await db.select().from(users).where(eq(users.auth0Id, claims.sub)).limit(1);
  if (!created) throw new Error("Provisioning failed to read back the user row.");
  return created;
}
