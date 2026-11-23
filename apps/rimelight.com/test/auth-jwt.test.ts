import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { sign } from "hono/jwt";
import { clearJwksCache, decodeJwt, verifyAuth0Jwt, verifySessionToken } from "../src/auth/jwt";

const SECRET = "test-session-secret";

function unsignedToken(payload: Record<string, unknown>): string {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(payload)}.`;
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearJwksCache();
});

describe("decodeJwt", () => {
  it("returns the payload without verifying the signature", () => {
    const token = unsignedToken({ sub: "auth0|123", email: "a@example.com" });
    expect(decodeJwt(token)).toEqual({ sub: "auth0|123", email: "a@example.com" });
  });

  it("rejects an empty token", () => {
    expect(() => decodeJwt("")).toThrow("Invalid JWT: token must be a non-empty string");
  });

  it("rejects a malformed token", () => {
    expect(() => decodeJwt("not-a-jwt")).toThrow("Invalid JWT structure");
  });
});

describe("verifySessionToken", () => {
  it("returns the payload for a valid HS256 token", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = await sign({ userId: "u1", exp: now + 60 }, SECRET, "HS256");
    const payload = await verifySessionToken<{ userId: string }>(token, SECRET);
    expect(payload?.userId).toBe("u1");
  });

  it("returns null for the wrong secret", async () => {
    const token = await sign({ userId: "u1" }, SECRET, "HS256");
    expect(await verifySessionToken(token, "other-secret")).toBeNull();
  });

  it("returns null for an expired token beyond the clock tolerance", async () => {
    const past = Math.floor(Date.now() / 1000) - 3600;
    const token = await sign({ userId: "u1", exp: past }, SECRET, "HS256");
    expect(await verifySessionToken(token, SECRET)).toBeNull();
  });

  it("returns null for an empty token", async () => {
    expect(await verifySessionToken("", SECRET)).toBeNull();
  });
});

describe("verifyAuth0Jwt", () => {
  it("returns null when the tenant JWKS cannot be fetched", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );
    const token = unsignedToken({ sub: "auth0|123" });
    const result = await verifyAuth0Jwt(token, { domain: "example.eu.auth0.com" });
    expect(result).toBeNull();
  });
});
