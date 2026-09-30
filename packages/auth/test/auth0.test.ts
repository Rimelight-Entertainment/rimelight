import { describe, expect, it } from "vite-plus/test";
import {
  auth0Auth,
  createAuth0AuthorizeUrl,
  createAuth0LogoutUrl,
  createSessionToken,
  loginWithAuth0Password,
  mapAuth0PayloadToSession,
  refreshAuth0Token,
  verifySessionToken,
} from "../src/adapters/auth0";
import type { UserSessionContext } from "../src/types";

describe("auth0Auth Adapter & Helpers", () => {
  it("generates correct Auth0 authorization URL", () => {
    const url = createAuth0AuthorizeUrl({
      domain: "rimelight.us.auth0.com",
      clientId: "client123",
      redirectUri: "https://rimelight.com/api/auth/callback",
      audience: "https://api.rimelight.com",
      state: "xyzState",
    });

    const parsed = new URL(url);
    expect(parsed.origin).toBe("https://rimelight.us.auth0.com");
    expect(parsed.pathname).toBe("/authorize");
    expect(parsed.searchParams.get("client_id")).toBe("client123");
    expect(parsed.searchParams.get("redirect_uri")).toBe("https://rimelight.com/api/auth/callback");
    expect(parsed.searchParams.get("audience")).toBe("https://api.rimelight.com");
    expect(parsed.searchParams.get("response_type")).toBe("code");
  });

  it("generates correct Auth0 logout URL", () => {
    const url = createAuth0LogoutUrl({
      domain: "rimelight.us.auth0.com",
      clientId: "client123",
      returnTo: "https://rimelight.com/",
    });

    const parsed = new URL(url);
    expect(parsed.pathname).toBe("/v2/logout");
    expect(parsed.searchParams.get("client_id")).toBe("client123");
    expect(parsed.searchParams.get("returnTo")).toBe("https://rimelight.com/");
  });

  it("creates and verifies signed session tokens (HS256)", async () => {
    const secret = "a_super_secret_signing_key_for_testing_12345";
    const session: UserSessionContext = {
      userId: "auth0|654321",
      email: "idan@rimelight.com",
      name: "Idan T.",
      avatar: "https://cdn.rimelight.com/avatar.png",
      roles: ["admin"],
      permissions: ["cms:manage"],
      userType: "employee",
    };

    const token = await createSessionToken(session, secret, "1h");
    expect(token).toBeTypeOf("string");

    const verified = await verifySessionToken(token, secret);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("auth0|654321");
    expect(verified?.email).toBe("idan@rimelight.com");
    expect(verified?.roles).toContain("admin");
    expect(verified?.userType).toBe("employee");
  });

  it("maps Auth0 payload correctly with roles and employee type", () => {
    const payload = {
      sub: "auth0|999",
      email: "engineer@rimelight.com",
      name: "Software Engineer",
      "https://rimelight.com/roles": ["editor", "employee"],
      "https://rimelight.com/user_type": "employee",
      permissions: ["page:create", "page:update"],
    };

    const session = mapAuth0PayloadToSession(payload, {
      rolesClaim: "https://rimelight.com/roles",
      userTypeClaim: "https://rimelight.com/user_type",
      permissionsClaim: "permissions",
      defaultRole: "user",
    });

    expect(session.userId).toBe("auth0|999");
    expect(session.email).toBe("engineer@rimelight.com");
    expect(session.roles).toEqual(["editor", "employee"]);
    expect(session.permissions).toEqual(["page:create", "page:update"]);
    expect(session.userType).toBe("employee");
  });

  it("resolves session from cookie using auth0Auth adapter", async () => {
    const secret = "session_secret_key_12345678901234567890";
    const adapter = auth0Auth({
      domain: "rimelight.us.auth0.com",
      sessionCookieName: "rimelight_session",
      sessionSecret: secret,
    });

    const sessionData: UserSessionContext = {
      userId: "auth0|111",
      email: "staff@rimelight.com",
      name: "Staff",
      roles: ["admin"],
      permissions: ["*"],
      userType: "employee",
    };

    const token = await createSessionToken(sessionData, secret);
    const req = new Request("https://rimelight.com/dashboard", {
      headers: {
        cookie: `rimelight_session=${token}; other_cookie=123`,
      },
    });

    const session = await adapter.getSession(req);
    expect(session).not.toBeNull();
    expect(session?.userId).toBe("auth0|111");
    expect(session?.email).toBe("staff@rimelight.com");
    expect(session?.userType).toBe("employee");
  });

  it("authenticates via loginWithAuth0Password (ROPC for native/UE5 clients)", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, init) => {
        const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
        expect(urlStr).toBe("https://rimelight.us.auth0.com/oauth/token");
        const body = JSON.parse(typeof init?.body === "string" ? init.body : "{}");
        expect(body.grant_type).toBe("password");
        expect(body.username).toBe("player1");
        expect(body.password).toBe("secret123");
        expect(body.client_id).toBe("ue5_client");
        expect(body.client_secret).toBe("ue5_secret");
        expect(body.audience).toBe("https://api.rimelight.com");

        return new Response(
          JSON.stringify({
            access_token: "mock_ue5_jwt_access",
            id_token: "mock_ue5_id_token",
            refresh_token: "mock_ue5_refresh_token",
            token_type: "Bearer",
            expires_in: 86400,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      };

      const res = await loginWithAuth0Password({
        domain: "rimelight.us.auth0.com",
        clientId: "ue5_client",
        clientSecret: "ue5_secret",
        username: "player1",
        password: "secret123",
        audience: "https://api.rimelight.com",
      });

      expect(res.access_token).toBe("mock_ue5_jwt_access");
      expect(res.refresh_token).toBe("mock_ue5_refresh_token");
      expect(res.expires_in).toBe(86400);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("refreshes token via refreshAuth0Token", async () => {
    const originalFetch = globalThis.fetch;
    try {
      globalThis.fetch = async (url, init) => {
        const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : url.url;
        expect(urlStr).toBe("https://rimelight.us.auth0.com/oauth/token");
        const body = JSON.parse(typeof init?.body === "string" ? init.body : "{}");
        expect(body.grant_type).toBe("refresh_token");
        expect(body.refresh_token).toBe("mock_ue5_refresh_token");
        expect(body.client_id).toBe("ue5_client");

        return new Response(
          JSON.stringify({
            access_token: "new_ue5_access_token",
            token_type: "Bearer",
            expires_in: 86400,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      };

      const res = await refreshAuth0Token({
        domain: "rimelight.us.auth0.com",
        clientId: "ue5_client",
        refreshToken: "mock_ue5_refresh_token",
      });

      expect(res.access_token).toBe("new_ue5_access_token");
      expect(res.expires_in).toBe(86400);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
