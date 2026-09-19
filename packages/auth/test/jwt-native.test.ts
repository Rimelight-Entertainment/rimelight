import { describe, expect, it, beforeEach } from "vite-plus/test"
import {
  base64UrlDecode,
  base64UrlDecodeToString,
  base64UrlEncode,
  clearJwksCache,
  createSessionToken,
  decodeJwt,
  decodeJwtHeader,
  parseDuration,
  verifyJwtRs256,
  verifySessionToken
} from "../src/jwt"
import { verifyAuth0Jwt } from "../src/adapters/auth0"

// Helper to create an RS256 token signed with Web Crypto for tests
async function generateTestRsaKeyPair(kid = "test-key-1") {
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256"
    },
    true,
    ["sign", "verify"]
  )) as CryptoKeyPair

  const jwk = (await crypto.subtle.exportKey("jwk", keyPair.publicKey)) as Record<string, any>
  jwk["kid"] = kid
  jwk["use"] = "sig"
  jwk["alg"] = "RS256"

  return { keyPair, jwk }
}

async function signTestRs256Jwt(
  payload: Record<string, any>,
  privateKey: CryptoKey,
  headerOverrides: Record<string, any> = {},
  kid = "test-key-1"
): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid,
    ...headerOverrides
  }

  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    privateKey,
    new TextEncoder().encode(data)
  )

  const sigB64 = base64UrlEncode(new Uint8Array(signature))
  return `${data}.${sigB64}`
}

describe("Zero-Dependency Web Crypto JWT Engine", () => {
  beforeEach(() => {
    clearJwksCache()
  })

  describe("Base64URL & Duration Utilities", () => {
    it("round-trips strings, UTF-8 unicode, and byte buffers correctly", () => {
      const original = "Hello World! 🚀 @rimelight/auth 100% zero-dep"
      const encoded = base64UrlEncode(original)
      expect(encoded).not.toContain("+")
      expect(encoded).not.toContain("/")
      expect(encoded).not.toContain("=")

      const decoded = base64UrlDecodeToString(encoded)
      expect(decoded).toBe(original)

      const rawBytes = new Uint8Array([0, 1, 2, 255, 128, 64])
      const encodedBytes = base64UrlEncode(rawBytes)
      const decodedBytes = base64UrlDecode(encodedBytes)
      expect(Array.from(decodedBytes)).toEqual(Array.from(rawBytes))
    })

    it("parses duration strings into seconds accurately", () => {
      expect(parseDuration(0)).toBe(0)
      expect(parseDuration("0")).toBe(0)
      expect(parseDuration("0s")).toBe(0)
      expect(parseDuration("")).toBe(604800) // Default 7d
      expect(parseDuration(120)).toBe(120)
      expect(parseDuration("45s")).toBe(45)
      expect(parseDuration("10m")).toBe(600)
      expect(parseDuration("2h")).toBe(7200)
      expect(parseDuration("7d")).toBe(604800)
      expect(parseDuration("2w")).toBe(1209600)
      expect(parseDuration("1y")).toBe(31536000)
    })

    it("handles invalid duration strings by falling back safely to default duration", () => {
      expect(parseDuration("abc")).toBe(604800)
    })
  })

  describe("JWT Header and Payload Inspection", () => {
    it("decodes headers and payloads correctly", () => {
      const header = { alg: "HS256", typ: "JWT", kid: "key-99" }
      const payload = { sub: "user-123", email: "user@rimelight.com" }
      const token = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.mock_sig`

      expect(decodeJwtHeader(token)).toEqual(header)
      expect(decodeJwt(token)).toEqual(payload)
    })

    it("throws error for malformed token strings", () => {
      expect(() => decodeJwt("")).toThrow("Invalid JWT")
      expect(() => decodeJwt("not-a-jwt")).toThrow("Invalid JWT")
    })
  })

  describe("HMAC-SHA256 (HS256) Session Tokens", () => {
    const secret = "super-secret-key-32-chars-long-rimelight!"

    it("creates and verifies valid session tokens", async () => {
      const session = {
        userId: "user-789",
        email: "alice@rimelight.com",
        roles: ["admin"]
      }

      const token = await createSessionToken(session, secret, "1h")
      expect(token.split(".")).toHaveLength(3)

      const verified = await verifySessionToken(token, secret)
      expect(verified).not.toBeNull()
      expect(verified?.["userId"]).toBe("user-789")
      expect(verified?.["email"]).toBe("alice@rimelight.com")
      expect(verified?.["roles"]).toEqual(["admin"])
      expect(verified?.["exp"]).toBeGreaterThan(Math.floor(Date.now() / 1000))
    })

    it("rejects token when secret is wrong", async () => {
      const session = { userId: "user-1" }
      const token = await createSessionToken(session, secret, "1h")
      const verified = await verifySessionToken(token, "wrong-secret-key")
      expect(verified).toBeNull()
    })

    it("rejects tampered payload", async () => {
      const session = { userId: "user-normal", roles: ["viewer"] }
      const token = await createSessionToken(session, secret, "1h")
      const parts = token.split(".")
      const h = parts[0]!
      const p = parts[1]!
      const s = parts[2]!

      const tamperedPayload = JSON.parse(base64UrlDecodeToString(p))
      tamperedPayload.roles = ["admin", "superadmin"]
      const tamperedToken = `${h}.${base64UrlEncode(JSON.stringify(tamperedPayload))}.${s}`

      const verified = await verifySessionToken(tamperedToken, secret)
      expect(verified).toBeNull()
    })

    it("rejects tampered signature", async () => {
      const session = { userId: "user-1" }
      const token = await createSessionToken(session, secret, "1h")
      const parts = token.split(".")
      const h = parts[0]!
      const p = parts[1]!
      const tamperedToken = `${h}.${p}.${base64UrlEncode("corrupted-signature")}`

      const verified = await verifySessionToken(tamperedToken, secret)
      expect(verified).toBeNull()
    })

    it("rejects expired session tokens beyond clock tolerance", async () => {
      const session = { userId: "user-expired" }
      // -100 seconds (well past default 10s tolerance)
      const token = await createSessionToken(session, secret, -100)
      const verified = await verifySessionToken(token, secret)
      expect(verified).toBeNull()

      // -10 seconds (past default 5s tolerance)
      const pastToleranceToken = await createSessionToken(session, secret, -10)
      const verifiedPastTolerance = await verifySessionToken(pastToleranceToken, secret)
      expect(verifiedPastTolerance).toBeNull()

      // -2 seconds (within default 5s tolerance)
      const recentExpiredToken = await createSessionToken(session, secret, -2)
      const verifiedWithinTolerance = await verifySessionToken(recentExpiredToken, secret)
      expect(verifiedWithinTolerance).not.toBeNull()

      // -2 seconds with strict clockTolerance: 0 should be rejected
      const verifiedStrict = await verifySessionToken(recentExpiredToken, secret, {
        clockTolerance: 0
      })
      expect(verifiedStrict).toBeNull()
    })

    it("rejects tokens with invalid alg header (e.g. none or RS256)", async () => {
      const header = { alg: "none", typ: "JWT" }
      const payload = { sub: "attacker", exp: Math.floor(Date.now() / 1000) + 3600 }
      const token = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.`

      const verified = await verifySessionToken(token, secret)
      expect(verified).toBeNull()
    })
  })

  describe("RS256 & Remote JWKS Verification", () => {
    it("verifies valid RS256 JWT against JWKS endpoint", async () => {
      const { keyPair, jwk } = await generateTestRsaKeyPair("auth0-key-1")
      const now = Math.floor(Date.now() / 1000)

      const payload = {
        sub: "auth0|123456",
        email: "dan@rimelight.com",
        iss: "https://rimelight.eu.auth0.com/",
        aud: "https://api.rimelight.com",
        iat: now,
        exp: now + 3600
      }

      const token = await signTestRs256Jwt(payload, keyPair.privateKey, {}, "auth0-key-1")

      const originalFetch = globalThis.fetch
      try {
        globalThis.fetch = async (url) => {
          const urlStr = typeof url === "string" ? url : url instanceof URL ? url.href : url.url
          expect(urlStr).toBe("https://rimelight.eu.auth0.com/.well-known/jwks.json")
          return new Response(JSON.stringify({ keys: [jwk] }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          })
        }

        const verified = await verifyJwtRs256(
          token,
          "https://rimelight.eu.auth0.com/.well-known/jwks.json",
          {
            issuer: "https://rimelight.eu.auth0.com",
            audience: "https://api.rimelight.com"
          }
        )

        expect(verified).not.toBeNull()
        expect(verified?.["sub"]).toBe("auth0|123456")
        expect(verified?.["email"]).toBe("dan@rimelight.com")
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it("rejects RS256 token when expired", async () => {
      const { keyPair, jwk } = await generateTestRsaKeyPair("auth0-key-expired")
      const now = Math.floor(Date.now() / 1000)

      const payload = {
        sub: "auth0|expired",
        iss: "https://rimelight.eu.auth0.com/",
        aud: "https://api.rimelight.com",
        exp: now - 300 // Expired 5 min ago
      }

      const token = await signTestRs256Jwt(payload, keyPair.privateKey, {}, "auth0-key-expired")

      const originalFetch = globalThis.fetch
      try {
        globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }))

        const verified = await verifyJwtRs256(
          token,
          "https://rimelight.eu.auth0.com/.well-known/jwks.json",
          { clockTolerance: 10 }
        )
        expect(verified).toBeNull()
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it("rejects RS256 token on issuer mismatch", async () => {
      const { keyPair, jwk } = await generateTestRsaKeyPair("auth0-key-iss")
      const now = Math.floor(Date.now() / 1000)

      const payload = {
        sub: "auth0|123",
        iss: "https://rogue-issuer.com/",
        aud: "https://api.rimelight.com",
        exp: now + 3600
      }

      const token = await signTestRs256Jwt(payload, keyPair.privateKey, {}, "auth0-key-iss")

      const originalFetch = globalThis.fetch
      try {
        globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }))

        const verified = await verifyJwtRs256(
          token,
          "https://rimelight.eu.auth0.com/.well-known/jwks.json",
          { issuer: "https://rimelight.eu.auth0.com" }
        )
        expect(verified).toBeNull()
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it("rejects RS256 token on audience mismatch", async () => {
      const { keyPair, jwk } = await generateTestRsaKeyPair("auth0-key-aud")
      const now = Math.floor(Date.now() / 1000)

      const payload = {
        sub: "auth0|123",
        iss: "https://rimelight.eu.auth0.com/",
        aud: "https://other-audience.com",
        exp: now + 3600
      }

      const token = await signTestRs256Jwt(payload, keyPair.privateKey, {}, "auth0-key-aud")

      const originalFetch = globalThis.fetch
      try {
        globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }))

        const verified = await verifyJwtRs256(
          token,
          "https://rimelight.eu.auth0.com/.well-known/jwks.json",
          { audience: "https://api.rimelight.com" }
        )
        expect(verified).toBeNull()
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it("refreshes JWKS cache on encountering an unknown kid (key rotation)", async () => {
      const key1 = await generateTestRsaKeyPair("key-old")
      const key2 = await generateTestRsaKeyPair("key-rotated-new")
      const now = Math.floor(Date.now() / 1000)

      let fetchCount = 0
      const originalFetch = globalThis.fetch

      try {
        globalThis.fetch = async () => {
          fetchCount++
          // First fetch returns only old key; second fetch returns both
          if (fetchCount === 1) {
            return new Response(JSON.stringify({ keys: [key1.jwk] }))
          }
          return new Response(JSON.stringify({ keys: [key1.jwk, key2.jwk] }))
        }

        // Token signed with new key
        const tokenNew = await signTestRs256Jwt(
          { sub: "rotated-user", exp: now + 3600 },
          key2.keyPair.privateKey,
          {},
          "key-rotated-new"
        )

        const verified = await verifyJwtRs256(
          tokenNew,
          "https://rimelight.eu.auth0.com/.well-known/jwks.json"
        )

        expect(verified).not.toBeNull()
        expect(verified?.["sub"]).toBe("rotated-user")
        expect(fetchCount).toBe(2) // Proves key rotation triggered auto-refresh
      } finally {
        globalThis.fetch = originalFetch
      }
    })

    it("integrates seamlessly with verifyAuth0Jwt helper", async () => {
      const { keyPair, jwk } = await generateTestRsaKeyPair("auth0-adapter-key")
      const now = Math.floor(Date.now() / 1000)

      const payload = {
        sub: "auth0|987654",
        email: "dev@rimelight.com",
        iss: "https://rimelight.eu.auth0.com/",
        aud: "https://api.rimelight.com",
        exp: now + 3600
      }

      const token = await signTestRs256Jwt(payload, keyPair.privateKey, {}, "auth0-adapter-key")

      const originalFetch = globalThis.fetch
      try {
        globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }))

        const result = await verifyAuth0Jwt(token, {
          domain: "rimelight.eu.auth0.com",
          audience: "https://api.rimelight.com"
        })

        expect(result).not.toBeNull()
        expect(result?.["sub"]).toBe("auth0|987654")
        expect(result?.["email"]).toBe("dev@rimelight.com")
      } finally {
        globalThis.fetch = originalFetch
      }
    })
  })
})
