import { describe, expect, it } from "vite-plus/test";
import { cfAccessAuth } from "../src/adapters/cf-access";
import { auth0Auth } from "../src/adapters/auth0";
import { mockAuth } from "../src/adapters/mock";

describe("@rimelight/auth - Security, Token Tampering and Edge Failure Tests", () => {
  describe("Cloudflare Access Adapter Edge and Hostile Cases", () => {
    const adapter = cfAccessAuth({
      adminEmails: ["security-lead@rimelight.com"],
      defaultRole: "superadmin"
    });

    it("rejects when both identity headers are missing", async () => {
      const req = new Request("https://rimelight.com/admin");
      const session = await adapter.getSession(req);
      expect(session).toBeNull();
    });

    it("assigns viewer role and non-admin permissions for non-admin email", async () => {
      const req = new Request("https://rimelight.com/admin", {
        headers: {
          "cf-access-authenticated-user-email": "random-attacker@evil.com"
        }
      });
      const session = await adapter.getSession(req);
      expect(session).not.toBeNull();
      expect(session?.email).toBe("random-attacker@evil.com");
      expect(session?.roles).toEqual(["viewer"]);
      expect(session?.permissions).toEqual([]);
    });

    it("assigns configured admin role for exact whitelisted admin emails", async () => {
      const req = new Request("https://rimelight.com/admin", {
        headers: {
          "cf-access-authenticated-user-email": "SECURITY-LEAD@rimelight.com "
        }
      });
      const session = await adapter.getSession(req);
      expect(session).not.toBeNull();
      expect(session?.email).toBe("security-lead@rimelight.com");
      expect(session?.roles).toEqual(["superadmin"]);
      expect(session?.permissions).toEqual(["*"]);
    });

    it("handles unauthorized redirect with absolute vs relative URLs properly", async () => {
      const unauthAdapter = cfAccessAuth({
        loginUrl: "/auth/login"
      });
      const req = new Request("https://rimelight.com/dashboard/settings");
      const res = await unauthAdapter.handleUnauthorized!(req);
      expect(res.status).toBe(302);
      expect(res.headers.get("Location")).toBe("https://rimelight.com/auth/login");
    });
  });

  describe("Auth0 and Mock Adapter Strict Edge Cases", () => {
    it("handles corrupt or truncated cookies without throwing exceptions", async () => {
      const auth0 = auth0Auth({ domain: "test.auth0.com", clientId: "xyz" });
      const req = new Request("https://rimelight.com/profile", {
        headers: {
          cookie: "appSession=corrupted.jwt.payload; other_cookie=123"
        }
      });
      const session = await auth0.getSession(req);
      expect(session).toBeNull();
    });

    it("Mock adapter properly returns configured custom session object", async () => {
      const customMock = mockAuth({
        session: {
          userId: "custom-agent-id",
          roles: ["editor"],
          email: "agent@rimelight.com"
        }
      });

      const session = await customMock.getSession(new Request("https://rimelight.com"));
      expect(session?.userId).toBe("custom-agent-id");
      expect(session?.email).toBe("agent@rimelight.com");
      expect(session?.roles).toEqual(["editor"]);
    });
  });
});
