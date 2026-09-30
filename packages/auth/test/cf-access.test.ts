import { describe, expect, it } from "vite-plus/test";
import { cfAccessAuth } from "../src/adapters/cf-access";

describe("cfAccessAuth Adapter", () => {
  it("returns null when no CF Access headers are present", async () => {
    const adapter = cfAccessAuth();
    const session = await adapter.getSession(new Request("https://idantity.me/cms"));
    expect(session).toBeNull();
  });

  it("resolves session from cf-access-authenticated-user-email header", async () => {
    const adapter = cfAccessAuth({
      adminEmails: ["admin@idantity.me"],
      defaultRole: "admin"
    });

    const req = new Request("https://idantity.me/cms", {
      headers: {
        "cf-access-authenticated-user-email": "admin@idantity.me"
      }
    });

    const session = await adapter.getSession(req);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("admin@idantity.me");
    expect(session?.email).toBe("admin@idantity.me");
    expect(session?.roles).toContain("admin");
    expect(session?.permissions).toContain("*");
    expect(session?.userType).toBe("employee");
  });

  it("assigns viewer role if email is not in adminEmails list", async () => {
    const adapter = cfAccessAuth({
      adminEmails: ["owner@idantity.me"],
      defaultRole: "admin"
    });

    const req = new Request("https://idantity.me/cms", {
      headers: {
        "cf-access-authenticated-user-email": "guest@example.com"
      }
    });

    const session = await adapter.getSession(req);
    expect(session).not.toBeNull();
    expect(session?.roles).toEqual(["viewer"]);
    expect(session?.permissions).toEqual([]);
  });
});
