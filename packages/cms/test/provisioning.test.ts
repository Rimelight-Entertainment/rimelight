import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { provisionCmsUser } from "../src/auth/provision";
import { migrateCms } from "../src/migrator/index";
import { cmsUsers } from "../src/schema/sqlite";
import { CmsError } from "../src/services/context";
import { createMockD1 } from "./helpers/d1";

let db: ReturnType<typeof drizzle>;

beforeEach(async () => {
  const { binding } = createMockD1();
  await migrateCms(binding);
  db = drizzle(binding);
});

const who = (email: string, groups: string[] = [], name?: string) => ({
  subject: `sub-${email}`,
  email,
  emailVerified: true,
  name,
  groups,
});

const provision = (identity: ReturnType<typeof who>, access = {}) =>
  provisionCmsUser(db, "sqlite", identity, access);

describe("CMS account provisioning", () => {
  it("makes the first account admin and later accounts the default viewer", async () => {
    const first = await provision(who("owner@example.com"));
    const second = await provision(who("guest@example.com"));

    expect(first.role).toBe("admin");
    expect(second.role).toBe("viewer");
    expect(second.id).not.toBe(first.id);
  });

  it("maps the first mapped IdP group to a CMS role", async () => {
    await provision(who("owner@example.com"));

    const editor = await provision(who("ed@example.com", ["staff", "editors"]), {
      roleMapping: { editors: "editor" },
    });

    expect(editor.role).toBe("editor");
  });

  it("normalises email case so one person maps to one account", async () => {
    const first = await provision(who("Ann@Example.com"));
    const again = await provision(who("ann@example.com"));

    expect(again.id).toBe(first.id);
  });

  it("keeps an existing role unless syncRoles is enabled", async () => {
    await provision(who("owner@example.com"));
    const mapping = { roleMapping: { admins: "admin", editors: "editor" } };
    await provision(who("ed@example.com", ["editors"]), mapping);

    const withoutSync = await provision(who("ed@example.com", ["admins", "editors"]), mapping);
    expect(withoutSync.role).toBe("editor");

    const withSync = await provision(who("ed@example.com", ["admins", "editors"]), {
      ...mapping,
      syncRoles: true,
    });
    expect(withSync.role).toBe("admin");
  });

  it("refuses disabled accounts with 403", async () => {
    await provision(who("owner@example.com"));
    await provision(who("gone@example.com"));
    await db.update(cmsUsers).set({ disabled: true }).where(eq(cmsUsers.email, "gone@example.com"));

    const attempt = provision(who("gone@example.com"));

    await expect(attempt).rejects.toBeInstanceOf(CmsError);
    await expect(attempt).rejects.toMatchObject({ status: 403 });
  });

  it("does not create unknown accounts when autoProvision is off, but still admits existing ones", async () => {
    const owner = await provision(who("owner@example.com"));

    await expect(
      provision(who("stranger@example.com"), { autoProvision: false }),
    ).rejects.toMatchObject({ status: 403 });

    const returning = await provision(who("owner@example.com"), { autoProvision: false });
    expect(returning.id).toBe(owner.id);
  });

  it("turns database failures into 503 with Retry-After, never anonymous access", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const brokenDb = {
      select: () => {
        throw new Error("db down");
      },
    };

    const attempt = provisionCmsUser(brokenDb, "sqlite", who("owner@example.com"), {});

    await expect(attempt).rejects.toMatchObject({
      status: 503,
      headers: { "Retry-After": "60" },
    });
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it("makes exactly one of two simultaneous first sign-ins the admin", async () => {
    const results = await Promise.all([
      provision(who("first@example.com")),
      provision(who("second@example.com")),
    ]);

    expect(results.map((r) => r.role).sort()).toEqual(["admin", "viewer"]);
  });
});
