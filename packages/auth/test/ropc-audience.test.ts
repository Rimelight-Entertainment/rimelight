import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { getAuth0ConfigFromEnv, loginWithAuth0Password } from "../src/adapters/auth0";

const AUDIENCE = "https://api.rimelight.com";

describe("getAuth0ConfigFromEnv audience", () => {
  it("keeps an explicit audience override", () => {
    expect(
      getAuth0ConfigFromEnv({ audience: AUDIENCE, domain: "tenant.example.com" }).audience,
    ).toBe(AUDIENCE);
  });

  it("does not clobber the env audience with an undefined override", () => {
    const previous = process.env["AUTH0_AUDIENCE"];
    process.env["AUTH0_AUDIENCE"] = AUDIENCE;
    try {
      const config = getAuth0ConfigFromEnv({ audience: undefined, domain: "tenant.example.com" });
      expect(config.audience).toBe(AUDIENCE);
    } finally {
      if (previous === undefined) delete process.env["AUTH0_AUDIENCE"];
      else process.env["AUTH0_AUDIENCE"] = previous;
    }
  });
});

describe("loginWithAuth0Password audience", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("always sends audience in the ROPC body", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ access_token: "a", token_type: "Bearer", expires_in: 900 }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await loginWithAuth0Password({
      domain: "tenant.example.com",
      clientId: "client",
      clientSecret: "secret",
      username: "player@example.com",
      password: "pw",
      audience: AUDIENCE,
    });

    const init = fetchMock.mock.calls[0]?.[1];
    const body = JSON.parse(init?.body as string);
    expect(body.grant_type).toBe("password");
    expect(body.audience).toBe(AUDIENCE);
    expect(body.client_id).toBe("client");
  });
});
