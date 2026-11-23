import type { UserSession } from "./auth0";

/**
 * Synchronizes an authenticated Auth0 user or employee profile into Postgres. Called from the
 * /api/auth/callback handler after a successful code exchange.
 */
export async function syncAuth0UserToDb(session: UserSession) {
  try {
    if (!session.email) return null;

    const { getDb } = await import("#db");
    const db = getDb();
    const { employees } = await import("#db/schema/employees");
    const { users } = await import("#db/schema/users");
    const { eq, or } = await import("drizzle-orm");

    if (session.userType === "employee") {
      const existing = await db
        .select()
        .from(employees)
        .where(or(eq(employees.auth0Id, session.userId), eq(employees.email, session.email)))
        .limit(1);

      const role = session.roles[0] || "employee";

      if (existing.length > 0) {
        const [updated] = await db
          .update(employees)
          .set({
            auth0Id: session.userId,
            name: session.name || existing[0]!.name,
            avatar: session.avatar || existing[0]!.avatar,
            role,
            permissions: session.permissions,
            metadata: session.metadata || existing[0]!.metadata,
            updatedAt: new Date(),
          })
          .where(eq(employees.id, existing[0]!.id))
          .returning();
        return { type: "employee", record: updated };
      } else {
        const [inserted] = await db
          .insert(employees)
          .values({
            auth0Id: session.userId,
            email: session.email,
            name: session.name || session.email.split("@")[0] || "Employee",
            avatar: session.avatar || null,
            role,
            permissions: session.permissions,
            metadata: session.metadata || {},
          })
          .returning();
        return { type: "employee", record: inserted };
      }
    } else {
      const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.auth0Id, session.userId), eq(users.email, session.email)))
        .limit(1);

      if (existing.length > 0) {
        const [updated] = await db
          .update(users)
          .set({
            auth0Id: session.userId,
            name: session.name || existing[0]!.name,
            avatar: session.avatar || existing[0]!.avatar,
            emailVerified: true,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing[0]!.id))
          .returning();
        return { type: "user", record: updated };
      } else {
        const [inserted] = await db
          .insert(users)
          .values({
            auth0Id: session.userId,
            email: session.email,
            name: session.name || session.email.split("@")[0] || "User",
            tag: "0000",
            avatar: session.avatar || null,
            emailVerified: true,
          })
          .returning();
        return { type: "user", record: inserted };
      }
    }
  } catch (error) {
    console.error("[Auth] Error syncing Auth0 user to database:", error);
    return null;
  }
}
