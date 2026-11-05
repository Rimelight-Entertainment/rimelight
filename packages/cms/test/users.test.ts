import { beforeEach, describe, expect, it } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { provisionCmsUser } from "../src/auth/provision";
import { migrateCms } from "../src/migrator/index";
import { cmsUsers } from "../src/schema/sqlite";
import { createCms, type Cms } from "../src/services/index";
import { CmsError, type CmsActor } from "../src/services/context";
import { createMockD1 } from "./helpers/d1";

let db: ReturnType<typeof drizzle>;
let cms: Cms;

beforeEach(async () => {
  const { binding } = createMockD1();
  await migrateCms(binding);
  db = drizzle(binding);
  cms = createCms({ db, dialect: "sqlite", locales: ["en"] });
});

interface Seed {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  disabled?: boolean;
}

/** Inserts accounts directly so tests can use known ids as actors. */
async function seed(...rows: Seed[]): Promise<void> {
  const now = new Date();
  await db.insert(cmsUsers).values(
    rows.map((r) => ({
      id: r.id,
      email: r.email,
      name: r.name ?? null,
      role: r.role,
      subject: null,
      disabled: r.disabled ?? false,
      createdAt: now,
      updatedAt: now,
    })),
  );
}

const actorOf = (id: string, role: string): CmsActor => ({
  userId: id,
  roles: [role],
  permissions: [],
});

/** Not an account row: a permission-only identity, like a deployment-level service actor. */
const serviceActor: CmsActor = { userId: "service", roles: [], permissions: ["*"] };

async function expectError(p: Promise<unknown>, status: number, message?: string): Promise<void> {
  try {
    await p;
  } catch (err) {
    expect(err).toBeInstanceOf(CmsError);
    expect((err as CmsError).status).toBe(status);
    if (message !== undefined) expect((err as CmsError).message).toBe(message);
    return;
  }
  throw new Error(`expected CmsError ${status}`);
}

describe("user administration access", () => {
  it("refuses every operation to non-admin actors", async () => {
    await seed(
      { id: "admin-1", email: "ada@example.com", role: "admin" },
      {
        id: "editor-1",
        email: "eve@example.com",
        role: "editor",
      },
    );
    const editor = actorOf("editor-1", "editor");

    await expectError(cms.users.listUsers(editor), 403);
    await expectError(cms.users.getUser(editor, "admin-1"), 403);
    await expectError(cms.users.inviteUser(editor, { email: "new@example.com" }), 403);
    await expectError(cms.users.updateUser(editor, "editor-1", { name: "Eve" }), 403);
    await expectError(cms.users.setUserDisabled(editor, "admin-1", true), 403);
  });
});

describe("inviting users", () => {
  it("pre-creates an unlinked row that the invitee's first sign-in adopts with the invited role", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    const admin = actorOf("admin-1", "admin");

    const invited = await cms.users.inviteUser(admin, {
      email: "  New.Person@Example.com ",
      role: "editor",
      name: " New ",
    });
    expect(invited).toMatchObject({
      email: "new.person@example.com",
      name: "New",
      role: "editor",
      disabled: false,
      linked: false,
    });

    const signedIn = await provisionCmsUser(db, "sqlite", {
      subject: "auth0|123",
      email: "New.Person@Example.com",
      emailVerified: true,
      name: "Newcomer",
      groups: [],
    });
    expect(signedIn.id).toBe(invited.id);
    expect(signedIn.role).toBe("editor");

    const after = await cms.users.getUser(admin, invited.id);
    expect(after.linked).toBe(true);
  });

  it("rejects an email already in use, regardless of case, and invalid input", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    const admin = actorOf("admin-1", "admin");

    await expectError(cms.users.inviteUser(admin, { email: "ADA@example.com" }), 409);
    await expectError(cms.users.inviteUser(admin, { email: "not-an-email" }), 422);
    await expectError(
      cms.users.inviteUser(admin, { email: "new@example.com", role: "superuser" }),
      422,
    );
  });
});

describe("listing users", () => {
  it("searches email and name case-insensitively, treating LIKE wildcards literally", async () => {
    await seed(
      { id: "a", email: "bob_1@example.com", role: "viewer" },
      { id: "b", email: "bob1@example.com", role: "viewer" },
      { id: "c", email: "eve@example.com", role: "editor", name: "Eve Lin" },
    );
    const admin = actorOf("a", "admin");

    const underscore = await cms.users.listUsers(admin, { search: "_1" });
    expect(underscore.users.map((u) => u.email)).toEqual(["bob_1@example.com"]);

    const byName = await cms.users.listUsers(admin, { search: "LIN" });
    expect(byName.users.map((u) => u.email)).toEqual(["eve@example.com"]);
  });

  it("filters by role", async () => {
    await seed(
      { id: "a", email: "ada@example.com", role: "admin" },
      { id: "b", email: "eve@example.com", role: "editor" },
      { id: "c", email: "zed@example.com", role: "editor" },
    );
    const admin = actorOf("a", "admin");

    const editors = await cms.users.listUsers(admin, { role: "editor" });
    expect(editors.users.map((u) => u.email)).toEqual(["eve@example.com", "zed@example.com"]);
  });

  it("pages results in email order with a total across all pages", async () => {
    await seed(
      { id: "a", email: "a@example.com", role: "viewer" },
      { id: "b", email: "b@example.com", role: "viewer" },
      { id: "c", email: "c@example.com", role: "viewer" },
    );
    const admin = actorOf("a", "admin");

    const first = await cms.users.listUsers(admin, { limit: 2 });
    expect(first.total).toBe(3);
    expect(first.users.map((u) => u.email)).toEqual(["a@example.com", "b@example.com"]);

    const second = await cms.users.listUsers(admin, { limit: 2, offset: 2 });
    expect(second.total).toBe(3);
    expect(second.users.map((u) => u.email)).toEqual(["c@example.com"]);
  });

  it("counts only matching rows in total and rejects invalid paging values", async () => {
    await seed(
      { id: "a", email: "a@example.com", role: "viewer" },
      { id: "b", email: "b@example.com", role: "editor" },
      { id: "c", email: "c@example.com", role: "editor" },
    );
    const admin = actorOf("a", "admin");

    const page = await cms.users.listUsers(admin, { role: "editor", limit: 1 });
    expect(page.total).toBe(2);
    expect(page.users).toHaveLength(1);

    await expectError(cms.users.listUsers(admin, { limit: 0 }), 422);
    await expectError(cms.users.listUsers(admin, { limit: 101 }), 422);
    await expectError(cms.users.listUsers(admin, { limit: 1.5 }), 422);
    await expectError(cms.users.listUsers(admin, { offset: -1 }), 422);
  });
});

describe("updating users", () => {
  it("trims names and clears blank ones", async () => {
    await seed(
      { id: "admin-1", email: "ada@example.com", role: "admin" },
      { id: "u-1", email: "u@example.com", role: "viewer", name: "Old" },
    );
    const admin = actorOf("admin-1", "admin");

    expect((await cms.users.updateUser(admin, "u-1", { name: "  Ada L.  " })).name).toBe("Ada L.");
    expect((await cms.users.updateUser(admin, "u-1", { name: "   " })).name).toBeNull();
  });

  it("returns 404 for an unknown account", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    await expectError(cms.users.getUser(actorOf("admin-1", "admin"), "missing"), 404);
  });
});

describe("user administration guards", () => {
  it("blocks changing your own role and disabling yourself, but allows same-role saves", async () => {
    await seed(
      { id: "admin-1", email: "ada@example.com", role: "admin" },
      { id: "admin-2", email: "bo@example.com", role: "admin" },
    );
    const self = actorOf("admin-1", "admin");

    await expectError(
      cms.users.updateUser(self, "admin-1", { role: "editor" }),
      400,
      "SELF_ROLE_CHANGE",
    );
    await expectError(cms.users.setUserDisabled(self, "admin-1", true), 400, "SELF_DISABLE");

    const saved = await cms.users.updateUser(self, "admin-1", { role: "admin", name: "Ada" });
    expect(saved).toMatchObject({ role: "admin", name: "Ada" });
  });

  it("never leaves zero enabled admins by demotion or disabling", async () => {
    await seed(
      { id: "owner-1", email: "owner@example.com", role: "owner" },
      { id: "editor-1", email: "eve@example.com", role: "editor" },
      { id: "admin-old", email: "old@example.com", role: "admin", disabled: true },
    );

    await expectError(
      cms.users.updateUser(serviceActor, "owner-1", { role: "viewer" }),
      400,
      "LAST_ADMIN",
    );
    await expectError(cms.users.setUserDisabled(serviceActor, "owner-1", true), 400, "LAST_ADMIN");

    // Once a second enabled admin exists, the original can be demoted.
    await cms.users.updateUser(serviceActor, "editor-1", { role: "admin" });
    const demoted = await cms.users.updateUser(serviceActor, "owner-1", { role: "viewer" });
    expect(demoted.role).toBe("viewer");

    // The disabled admin does not count: editor-1 is now the only enabled admin.
    await expectError(cms.users.setUserDisabled(serviceActor, "editor-1", true), 400, "LAST_ADMIN");
  });

  const rejectedErrors = (results: PromiseSettledResult<unknown>[]): CmsError[] =>
    results.flatMap((r) => (r.status === "rejected" ? [r.reason as CmsError] : []));

  it("keeps one enabled admin when two admins are disabled at the same time", async () => {
    await seed(
      { id: "admin-1", email: "ada@example.com", role: "admin" },
      { id: "admin-2", email: "bo@example.com", role: "admin" },
    );

    const results = await Promise.allSettled([
      cms.users.setUserDisabled(serviceActor, "admin-1", true),
      cms.users.setUserDisabled(serviceActor, "admin-2", true),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(rejectedErrors(results).map((e) => [e.status, e.message])).toEqual([
      [400, "LAST_ADMIN"],
    ]);

    const { users } = await cms.users.listUsers(serviceActor, { role: "admin" });
    expect(users.filter((u) => !u.disabled)).toHaveLength(1);
  });

  it("keeps one enabled admin when one is demoted while the other is disabled", async () => {
    await seed(
      { id: "owner-1", email: "owner@example.com", role: "owner" },
      { id: "admin-2", email: "bo@example.com", role: "admin" },
    );

    const results = await Promise.allSettled([
      cms.users.updateUser(serviceActor, "owner-1", { role: "viewer" }),
      cms.users.setUserDisabled(serviceActor, "admin-2", true),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(rejectedErrors(results).map((e) => [e.status, e.message])).toEqual([
      [400, "LAST_ADMIN"],
    ]);

    const { users } = await cms.users.listUsers(serviceActor, {});
    expect(
      users.filter((u) => !u.disabled && (u.role === "owner" || u.role === "admin")),
    ).toHaveLength(1);
  });

  it("gives one of two simultaneous invites for the same email a 409", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    const admin = actorOf("admin-1", "admin");

    const results = await Promise.allSettled([
      cms.users.inviteUser(admin, { email: "dup@example.com" }),
      cms.users.inviteUser(admin, { email: "DUP@example.com" }),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(rejectedErrors(results).map((e) => [e.status, e.message])).toEqual([
      [409, "User already exists"],
    ]);
  });
});

describe("disabling users", () => {
  it("refuses sign-in while disabled and allows it again once re-enabled", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    const admin = actorOf("admin-1", "admin");
    const invited = await cms.users.inviteUser(admin, { email: "new@example.com", role: "editor" });
    const identity = {
      subject: "auth0|9",
      email: "new@example.com",
      emailVerified: true,
      groups: [],
    };

    const disabled = await cms.users.setUserDisabled(admin, invited.id, true);
    expect(disabled.disabled).toBe(true);
    await expectError(provisionCmsUser(db, "sqlite", identity), 403);

    await cms.users.setUserDisabled(admin, invited.id, false);
    const signedIn = await provisionCmsUser(db, "sqlite", identity);
    expect(signedIn.id).toBe(invited.id);
  });
});

describe("admin-set fields survive identity sync", () => {
  const idp = (email: string, extra: { name?: string; groups?: string[] } = {}) => ({
    subject: `sub-${email}`,
    email,
    emailVerified: true,
    groups: extra.groups ?? [],
    ...(extra.name !== undefined ? { name: extra.name } : {}),
  });

  it("keeps an invited name when the identity provider reports another", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    await cms.users.inviteUser(actorOf("admin-1", "admin"), {
      email: "new@example.com",
      role: "editor",
      name: "Invited Name",
    });

    const signedIn = await provisionCmsUser(
      db,
      "sqlite",
      idp("new@example.com", { name: "IdP Name" }),
    );
    expect(signedIn.name).toBe("Invited Name");
  });

  it("keeps an admin-set role when syncRoles would map a different one", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    await cms.users.inviteUser(actorOf("admin-1", "admin"), {
      email: "new@example.com",
      role: "viewer",
    });

    const signedIn = await provisionCmsUser(
      db,
      "sqlite",
      idp("new@example.com", { groups: ["admins"] }),
      { roleMapping: { admins: "admin" }, syncRoles: true },
    );
    expect(signedIn.role).toBe("viewer");
  });

  it("still applies IdP name and role changes to accounts an admin never edited", async () => {
    await seed({ id: "admin-1", email: "ada@example.com", role: "admin" });
    const access = { roleMapping: { admins: "admin" }, syncRoles: true };

    const first = await provisionCmsUser(db, "sqlite", idp("ann@example.com"), access);
    expect(first.role).toBe("viewer");

    const second = await provisionCmsUser(
      db,
      "sqlite",
      idp("ann@example.com", { name: "Ann Lee", groups: ["admins"] }),
      access,
    );
    expect(second).toMatchObject({ name: "Ann Lee", role: "admin" });
  });
});
