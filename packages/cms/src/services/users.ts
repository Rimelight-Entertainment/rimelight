import { and, asc, count, eq, inArray, sql, type SQL } from "drizzle-orm";
import { CMS_ROLES, isAdmin } from "../auth/roles";
import { withUserLock } from "../auth/user-lock";
import type { CmsUser } from "../schema/cms_users";
import { CmsError, notFound, type CmsActor, type CmsContext } from "./context";

/**
 * CMS account administration. Accounts are created by sign-in (auth/provision.ts) or pre-created
 * by an admin via `inviteUser`; an invited row is matched by email on the invitee's first sign-in.
 *
 * Guards: an actor cannot change their own role or disable themselves, and the last enabled
 * admin cannot be demoted or disabled. "Admin" means `isAdmin` (`owner` or `admin`). The last-admin
 * rule is enforced inside the write itself (see `writeUser`), so concurrent requests cannot both
 * pass the check.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_INVITE_ROLE = "viewer";
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export interface CmsUserRecord {
  id: string;
  email: string;
  name: string | null;
  role: string;
  disabled: boolean;
  /** True once the account has signed in and its identity-provider subject is recorded. */
  linked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserListOptions {
  /** Case-insensitive match on email or name. */
  search?: string | undefined;
  role?: string | undefined;
  /** Page size, an integer from 1 to 100. Defaults to 50. */
  limit?: number | undefined;
  /** Number of matching rows to skip. Defaults to 0. */
  offset?: number | undefined;
}

export interface UserPage {
  users: CmsUserRecord[];
  /** Rows matching the search and role filter, across all pages. */
  total: number;
}

export interface InviteUserInput {
  email: string;
  role?: string;
  name?: string | null;
}

export interface UpdateUserInput {
  name?: string | null;
  role?: string;
}

type UsersTable = CmsContext["t"]["cmsUsers"];
type UserPatch = Partial<
  Pick<CmsUser, "name" | "role" | "disabled" | "nameManaged" | "roleManaged" | "updatedAt">
>;

function assertAdmin(actor: CmsActor): void {
  if (!isAdmin(actor)) throw new CmsError(403, "Not allowed to manage users");
}

function normalizeRole(role: string): string {
  if (!(CMS_ROLES as readonly string[]).includes(role)) throw new CmsError(422, "Unknown role");
  return role;
}

function normalizeName(name: string | null): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed : null;
}

const isAdminRole = (role: string): boolean => isAdmin({ roles: [role], permissions: [] });
const ADMIN_ROLES = CMS_ROLES.filter(isAdminRole);
const isEnabledAdmin = (row: CmsUser): boolean => !row.disabled && isAdminRole(row.role);

function toRecord(row: CmsUser): CmsUserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    disabled: row.disabled,
    linked: row.subject !== null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** D1/SQLite reports "UNIQUE constraint failed"; Postgres reports SQLSTATE 23505. Drivers wrap the cause. */
function isUniqueViolation(err: unknown): boolean {
  for (let e: unknown = err; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    const { code, message } = e as { code?: unknown; message?: unknown };
    if (code === "23505") return true;
    if (
      typeof message === "string" &&
      /UNIQUE constraint failed|duplicate key value/i.test(message)
    ) {
      return true;
    }
  }
  return false;
}

async function findUser(db: CmsContext["db"], u: UsersTable, id: string): Promise<CmsUser> {
  const [row] = await db.select().from(u).where(eq(u.id, id)).limit(1);
  if (!row) throw notFound("User");
  return row;
}

const enabledAdmin = (u: UsersTable): SQL | undefined =>
  and(eq(u.disabled, false), inArray(u.role, ADMIN_ROLES));

/**
 * Counts enabled admins inside the statement that writes the row. The row being demoted or
 * disabled is itself an enabled admin, so "more than one" means another one remains.
 */
const keepsAnotherAdmin = (u: UsersTable): SQL =>
  sql`(select count(*) from ${u} where ${enabledAdmin(u)}) > 1`;

/**
 * Writes one account. When `guardLastAdmin` is set, the write matches only while another enabled
 * admin remains. The check and the write are one statement, so it holds on D1 without a
 * transaction; on Postgres the caller also runs it under `withUserLock`.
 */
async function writeUser(
  db: CmsContext["db"],
  u: UsersTable,
  id: string,
  patch: UserPatch,
  guardLastAdmin: boolean,
): Promise<CmsUser> {
  const target = guardLastAdmin ? and(eq(u.id, id), keepsAnotherAdmin(u)) : eq(u.id, id);
  const [row] = await db.update(u).set(patch).where(target).returning();
  if (!row) {
    if (guardLastAdmin) throw new CmsError(400, "LAST_ADMIN");
    throw notFound("User");
  }
  return row;
}

export async function listUsers(
  ctx: CmsContext,
  actor: CmsActor,
  options: UserListOptions = {},
): Promise<UserPage> {
  assertAdmin(actor);
  const limit = options.limit ?? DEFAULT_PAGE_SIZE;
  const offset = options.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_SIZE) {
    throw new CmsError(422, "limit must be an integer from 1 to 100");
  }
  if (!Number.isInteger(offset) || offset < 0) {
    throw new CmsError(422, "offset must be a non-negative integer");
  }

  const u = ctx.t.cmsUsers;
  const conditions: SQL[] = [];

  const term = options.search?.trim().toLowerCase();
  if (term) {
    // Escape LIKE wildcards so a search for "a_b" matches the literal text.
    const pattern = `%${term.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
    conditions.push(
      sql`(lower(${u.email}) like ${pattern} escape '\\' or lower(${u.name}) like ${pattern} escape '\\')`,
    );
  }
  if (options.role) conditions.push(eq(u.role, normalizeRole(options.role)));

  const where = and(...conditions);
  const [{ total }] = await ctx.db.select({ total: count() }).from(u).where(where);
  const rows = await ctx.db
    .select()
    .from(u)
    .where(where)
    .orderBy(asc(u.email))
    .limit(limit)
    .offset(offset);
  return { users: rows.map(toRecord), total: Number(total) };
}

export async function getUser(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
): Promise<CmsUserRecord> {
  assertAdmin(actor);
  return toRecord(await findUser(ctx.db, ctx.t.cmsUsers, id));
}

export async function updateUser(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  input: UpdateUserInput,
): Promise<CmsUserRecord> {
  assertAdmin(actor);
  const u = ctx.t.cmsUsers;
  return withUserLock(ctx.db, ctx.dialect, async (db) => {
    const current = await findUser(db, u, id);

    const patch: UserPatch = { updatedAt: new Date() };
    if (input.name !== undefined) {
      patch.name = normalizeName(input.name);
      patch.nameManaged = true;
    }
    if (input.role !== undefined) {
      const role = normalizeRole(input.role);
      if (role !== current.role) {
        if (current.id === actor.userId) throw new CmsError(400, "SELF_ROLE_CHANGE");
        patch.role = role;
        patch.roleManaged = true;
      }
    }

    const demotesAdmin =
      patch.role !== undefined && isEnabledAdmin(current) && !isAdminRole(patch.role);
    return toRecord(await writeUser(db, u, id, patch, demotesAdmin));
  });
}

export async function setUserDisabled(
  ctx: CmsContext,
  actor: CmsActor,
  id: string,
  disabled: boolean,
): Promise<CmsUserRecord> {
  assertAdmin(actor);
  const u = ctx.t.cmsUsers;
  return withUserLock(ctx.db, ctx.dialect, async (db) => {
    const current = await findUser(db, u, id);
    if (current.disabled === disabled) return toRecord(current);
    if (disabled && current.id === actor.userId) throw new CmsError(400, "SELF_DISABLE");

    const demotesAdmin = disabled && isEnabledAdmin(current);
    return toRecord(await writeUser(db, u, id, { disabled, updatedAt: new Date() }, demotesAdmin));
  });
}

/**
 * Pre-creates an account so an admin can grant a role before the person signs in. The row has no
 * IdP subject yet; the first verified sign-in with this email links it and keeps the invited role.
 */
export async function inviteUser(
  ctx: CmsContext,
  actor: CmsActor,
  input: InviteUserInput,
): Promise<CmsUserRecord> {
  assertAdmin(actor);
  const email = input.email.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    throw new CmsError(422, "A valid email is required");
  }
  const role = normalizeRole(input.role ?? DEFAULT_INVITE_ROLE);
  const name = normalizeName(input.name ?? null);

  const u = ctx.t.cmsUsers;
  const [existing] = await ctx.db.select({ id: u.id }).from(u).where(eq(u.email, email)).limit(1);
  if (existing) throw new CmsError(409, "User already exists");

  const now = new Date();
  try {
    const [row] = await ctx.db
      .insert(u)
      .values({
        id: crypto.randomUUID(),
        email,
        name,
        role,
        subject: null,
        disabled: false,
        // Admin-set values: IdP sync must not overwrite them on the invitee's first sign-in.
        nameManaged: name !== null,
        roleManaged: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return toRecord(row);
  } catch (err) {
    // Two invites for one email can both pass the check above; the unique index decides.
    if (isUniqueViolation(err)) throw new CmsError(409, "User already exists");
    throw err;
  }
}
