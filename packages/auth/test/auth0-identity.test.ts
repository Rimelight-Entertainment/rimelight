import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { auth0Auth, createSessionToken } from "../src/adapters/auth0";

const DOMAIN = "test.auth0.com";
const SECRET = "test-session-secret-0123456789abcdef";

// The JWKS is empty: no RS256 token can verify, so only the session-cookie path is exercised.
function stubEmptyJwks() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json({ keys: [] })),
  );
}

async function sessionCookie(secret: string, metadata: Record<string, unknown> = {}) {
  const token = await createSessionToken(
    {
      userId: "auth0|user-1",
      email: "ed@example.com",
      name: "Ed",
      roles: ["editor"],
      permissions: [],
      metadata,
    } as any,
    secret,
  );
  return `rimelight_session=${token}`;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("auth0 identity", () => {
  it("rejects a session cookie signed with a guessed secret when AUTH0_SECRET is not configured", async () => {
    stubEmptyJwks();
    const cookie = await sessionCookie("attacker-guessed-secret");
    const adapter = auth0Auth({ domain: DOMAIN, clientId: "client" });

    const request = new Request("https://rimelight.com/cms", { headers: { cookie } });

    expect(await adapter.identify!(request)).toBeNull();
    expect(await adapter.getSession(request)).toBeNull();
  });

  it("returns the verified identity from a session cookie signed with the configured secret", async () => {
    stubEmptyJwks();
    const cookie = await sessionCookie(SECRET, { email_verified: true });
    const adapter = auth0Auth({ domain: DOMAIN, clientId: "client", sessionSecret: SECRET });

    const identity = await adapter.identify!(
      new Request("https://rimelight.com", { headers: { cookie } }),
    );

    expect(identity).toEqual({
      subject: "auth0|user-1",
      email: "ed@example.com",
      emailVerified: true,
      name: "Ed",
      groups: ["editor"],
    });
  });

  it("reports an identity whose email is not verified as unverified", async () => {
    stubEmptyJwks();
    const cookie = await sessionCookie(SECRET, { email_verified: false });
    const adapter = auth0Auth({ domain: DOMAIN, clientId: "client", sessionSecret: SECRET });

    const identity = await adapter.identify!(
      new Request("https://rimelight.com", { headers: { cookie } }),
    );

    expect(identity?.emailVerified).toBe(false);
  });

  it("does not fall back to a valid session cookie when the Bearer token is invalid", async () => {
    stubEmptyJwks();
    const cookie = await sessionCookie(SECRET, { email_verified: true });
    const adapter = auth0Auth({ domain: DOMAIN, clientId: "client", sessionSecret: SECRET });

    const request = new Request("https://rimelight.com/cms", {
      headers: { authorization: "Bearer not-a-real-token", cookie },
    });

    expect(await adapter.identify!(request)).toBeNull();
  });
});
