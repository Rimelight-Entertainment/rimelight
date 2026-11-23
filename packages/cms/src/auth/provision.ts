import { eq, sql } from "drizzle-orm";
import type { AccessIdentity } from "../identity/types";
import { tablesFor, type Dialect } from "../db/index";
import { CmsError, serviceUnavailable } from "../services/context";
import { resolveMappedRole, type CmsAccessConfig } from "./access";
import { withUserLock } from "./user-lock";

export interface ProvisionedUser {
  id: string;
  name: string;
  role: string;
}

const DEFAULT_ROLE = "viewer";

/**
 * Resolves the CMS account for a verified identity, creating it on first sign-in.
 * Throws 403 for disabled or unprovisioned accounts and 503 when the database fails, so a
 * transient failure never degrades into anonymous access.
 *
 * Fields an admin has set (`nameManaged`, `roleManaged`) are never overwritten by IdP sync.
 */
export async function provisionCmsUser(
  db: any,
  dialect: Dialect,
  identity: AccessIdentity,
  access: CmsAccessConfig = {},
): Promise<ProvisionedUser> {
  const users = tablesFor(dialect).cmsUsers;
  const email = identity.email.trim().toLowerCase();
  const mapped =
    resolveMappedRole(identity.groups, access.roleMapping) ?? access.defaultRole ?? DEFAULT_ROLE;
  const findByEmail = async (conn: any) =>
    (await conn.select().from(users).where(eq(users.email, email)).limit(1))[0];

  try {
    let row = await findByEmail(db);
    if (!row) {
      if (access.autoProvision === false) throw new CmsError(403, "User not authorized");
      row = await withUserLock(db, dialect, async (conn) => {
        // Re-check under the lock: a concurrent first sign-in for this email may have created it.
        const existing = await findByEmail(conn);
        if (existing) return existing;
        const now = new Date();
        await conn
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            email,
            name: identity.name ?? null,
            // The first account ever created becomes admin. Deciding inside the INSERT keeps it
            // atomic on D1, where there are no transactions.
            role: sql`CASE WHEN (SELECT count(*) FROM ${users}) = 0 THEN 'admin' ELSE ${mapped} END`,
            subject: identity.subject,
            disabled: false,
            nameManaged: false,
            roleManaged: false,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
        return findByEmail(conn);
      });
      if (!row) throw serviceUnavailable();
    }

    if (row.disabled) throw new CmsError(403, "Account disabled");

    const changes: Record<string, unknown> = {};
    if (
      access.syncName !== false &&
      !row.nameManaged &&
      identity.name &&
      identity.name !== row.name
    ) {
      changes["name"] = identity.name;
    }
    if (access.syncRoles === true && !row.roleManaged && mapped !== row.role) {
      changes["role"] = mapped;
    }
    if (!row.subject && identity.subject) changes["subject"] = identity.subject;
    if (Object.keys(changes).length > 0) {
      changes["updatedAt"] = new Date();
      await db.update(users).set(changes).where(eq(users.id, row.id));
      row = { ...row, ...changes };
    }

    return { id: row.id, name: row.name ?? email, role: row.role };
  } catch (err) {
    if (err instanceof CmsError) throw err;
    console.error("[@rimelight/cms] account provisioning failed", err);
    throw serviceUnavailable();
  }
}
