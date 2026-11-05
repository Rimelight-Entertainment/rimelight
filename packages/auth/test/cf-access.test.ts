import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cfAccessAuth, cfAccessIdentifier } from "../src/adapters/cf-access";
import { base64UrlEncode, clearJwksCache } from "../src/jwt";

const TEAM = "team.example.com";
const ISSUER = `https://${TEAM}`;
const AUD = "aud-tag-123";
const CERTS_URL = `${ISSUER}/cdn-cgi/access/certs`;
const IDENTITY_URL = `${ISSUER}/cdn-cgi/access/get-identity`;

async function generateKey(kid = "k1") {
  const pair = (await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"],
  )) as CryptoKeyPair;
  const jwk = {
    ...(await crypto.subtle.exportKey("jwk", pair.publicKey)),
    kid,
    alg: "RS256",
    use: "sig",
  };
  return { privateKey: pair.privateKey, jwk };
}

async function signToken(privateKey: CryptoKey, claims: Record<string, unknown>, kid = "k1") {
  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT", kid }));
  const payload = base64UrlEncode(JSON.stringify(claims));
  const input = `${header}.${payload}`;
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(input),
  );
  return `${input}.${base64UrlEncode(new Uint8Array(sig))}`;
}

const nowSec = () => Math.floor(Date.now() / 1000);

function claims(overrides: Record<string, unknown> = {}) {
  return {
    iss: ISSUER,
    aud: AUD,
    sub: "user-1",
    email: "staff@example.com",
    name: "Staff",
    iat: nowSec(),
    exp: nowSec() + 300,
    ...overrides,
  };
}

function stubAccess(opts: {
  jwk: JsonWebKey;
  groups?: { name: string }[];
  identityStatus?: number;
}) {
  const fetchMock = vi.fn(async (input: string | URL | Request) => {
    const url = input instanceof Request ? input.url : input.toString();
    if (url === CERTS_URL) return Response.json({ keys: [opts.jwk] });
    if (url === IDENTITY_URL) {
      if (opts.identityStatus && opts.identityStatus !== 200) {
        return new Response("unavailable", { status: opts.identityStatus });
      }
      return Response.json({ groups: opts.groups ?? [{ name: "staff" }] });
    }
    throw new Error(`unexpected fetch: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const withHeader = (token: string) =>
  new Request("https://rimelight.com/cms", { headers: { "cf-access-jwt-assertion": token } });
const withCookie = (token: string) =>
  new Request("https://rimelight.com/cms", { headers: { cookie: `CF_Authorization=${token}` } });

const options = { teamDomain: TEAM, audience: AUD };

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  clearJwksCache();
});

describe("cf-access identity", () => {
  it("returns the verified identity and Access groups for a valid assertion header", async () => {
    const key = await generateKey();
    stubAccess({ jwk: key.jwk });
    const token = await signToken(key.privateKey, claims());

    const identity = await cfAccessIdentifier(options)(withHeader(token));

    expect(identity).toEqual({
      subject: "user-1",
      email: "staff@example.com",
      emailVerified: true,
      name: "Staff",
      groups: ["staff"],
    });
  });

  it("accepts the CF_Authorization cookie when the assertion header is absent", async () => {
    const key = await generateKey();
    stubAccess({ jwk: key.jwk });
    const token = await signToken(key.privateKey, claims());

    const identity = await cfAccessIdentifier(options)(withCookie(token));

    expect(identity?.subject).toBe("user-1");
  });

  it("does not fall back to a valid cookie when the header token is invalid", async () => {
    const key = await generateKey();
    stubAccess({ jwk: key.jwk });
    const good = await signToken(key.privateKey, claims());
    const request = new Request("https://rimelight.com/cms", {
      headers: {
        "cf-access-jwt-assertion": "not.a.token",
        cookie: `CF_Authorization=${good}`,
      },
    });

    expect(await cfAccessIdentifier(options)(request)).toBeNull();
  });

  it("rejects a token signed by a key that is not in the team's JWKS", async () => {
    const trusted = await generateKey("k1");
    const attacker = await generateKey("k1");
    stubAccess({ jwk: trusted.jwk });
    const forged = await signToken(attacker.privateKey, claims(), "k1");

    expect(await cfAccessIdentifier(options)(withHeader(forged))).toBeNull();
  });

  it("rejects a token issued for a different application audience", async () => {
    const key = await generateKey();
    stubAccess({ jwk: key.jwk });
    const token = await signToken(key.privateKey, claims({ aud: "some-other-app" }));

    expect(await cfAccessIdentifier(options)(withHeader(token))).toBeNull();
  });

  it("rejects an expired token", async () => {
    const key = await generateKey();
    stubAccess({ jwk: key.jwk });
    const token = await signToken(key.privateKey, claims({ exp: nowSec() - 3600 }));

    expect(await cfAccessIdentifier(options)(withHeader(token))).toBeNull();
  });

  it("does not trust an email header without a signed assertion", async () => {
    const key = await generateKey();
    const fetchMock = stubAccess({ jwk: key.jwk });
    const request = new Request("https://rimelight.com/cms", {
      headers: { "cf-access-authenticated-user-email": "admin@example.com" },
    });

    expect(await cfAccessIdentifier(options)(request)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("makes no Access call when the request carries no token", async () => {
    const key = await generateKey();
    const fetchMock = stubAccess({ jwk: key.jwk });

    expect(await cfAccessIdentifier(options)(new Request("https://rimelight.com/cms"))).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when get-identity is unavailable, and getSession turns that into no session", async () => {
    const key = await generateKey();
    stubAccess({ jwk: key.jwk, identityStatus: 503 });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const token = await signToken(key.privateKey, claims());
    const adapter = cfAccessAuth(options);

    await expect(adapter.identify!(withHeader(token))).rejects.toThrow();
    expect(await adapter.getSession(withHeader(token))).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("requires a team domain and audience", () => {
    expect(() => cfAccessIdentifier({ teamDomain: "", audience: AUD })).toThrow();
    expect(() => cfAccessIdentifier({ teamDomain: TEAM, audience: "" })).toThrow();
  });
});
