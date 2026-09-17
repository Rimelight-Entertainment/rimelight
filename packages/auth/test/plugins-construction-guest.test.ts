import { describe, it, expect, vi } from "vitest"
import {
  isConstructionGuest,
  signInConstructionGuest,
  CONSTRUCTION_GUEST_COOKIE
} from "../src/plugins/construction-guest/index"

describe("@rimelight/auth construction-guest plugin", () => {
  const passphrase = "super-secret-construction-passphrase-123"

  const createMockContext = (cookieValue?: string, envPassphrase?: string) => {
    const cookies: Record<string, string> = cookieValue
      ? { [CONSTRUCTION_GUEST_COOKIE]: cookieValue }
      : {}
    const setCookies: Record<string, { value: string; options?: any }> = {}

    return {
      req: {
        raw: {
          headers: new Headers(
            cookieValue ? { cookie: `${CONSTRUCTION_GUEST_COOKIE}=${cookieValue}` } : {}
          )
        },
        header: (name: string) => {
          if (name.toLowerCase() === "cookie") {
            return cookieValue ? `${CONSTRUCTION_GUEST_COOKIE}=${cookieValue}` : undefined
          }
          return undefined
        }
      },
      res: {
        headers: new Headers()
      },
      header: (name: string, value: string) => {},
      env: {
        CONSTRUCTION_PASSPHRASE: envPassphrase || passphrase
      },
      _cookies: cookies,
      _setCookies: setCookies
    }
  }

  it("should fail sign in with wrong passphrase", async () => {
    const ctx = createMockContext()
    const result = await signInConstructionGuest(ctx, "wrong-passphrase")
    expect(result).toBe(false)
  })

  it("should sign in successfully and set signed cookie", async () => {
    const ctx = createMockContext()
    const result = await signInConstructionGuest(ctx, passphrase)
    expect(result).toBe(true)
  })

  it("should return false for unauthenticated requests", async () => {
    const ctx = createMockContext(undefined)
    const isGuest = await isConstructionGuest(ctx)
    expect(isGuest).toBe(false)
  })

  it("should authenticate valid signed guest cookies and reject tampered cookies", async () => {
    const signCtx = createMockContext()
    await signInConstructionGuest(signCtx, passphrase)

    // Capture set-cookie
    const cookieHeader = signCtx.res.headers.get("set-cookie") || ""
    const tokenMatch = cookieHeader.match(new RegExp(`${CONSTRUCTION_GUEST_COOKIE}=([^;]+)`))
    if (tokenMatch) {
      const validToken = tokenMatch[1]
      const validCtx = createMockContext(validToken)
      expect(await isConstructionGuest(validCtx)).toBe(true)

      // Tampered token
      const tamperedToken = validToken.slice(0, -4) + "XXXX"
      const tamperedCtx = createMockContext(tamperedToken)
      expect(await isConstructionGuest(tamperedCtx)).toBe(false)
    }
  })
})
