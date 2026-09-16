import { getCookie, setCookie } from "hono/cookie"
import type { ConstructionOptions } from "../types"

export const CONSTRUCTION_GUEST_COOKIE = "rimelight-construction-guest"

const DEFAULT_WHITELISTED_PATTERNS = [
  "/construction",
  "/api/auth",
  "/api/construction-guest",
  "/_astro/",
  "/_image",
  "/favicon.",
  "/robots.txt",
  "/sitemap",
  "/.well-known/"
]

const getPassphrase = (c: any, options?: ConstructionOptions): string | undefined => {
  if (options?.passphrase) return options.passphrase
  const envKey = options?.passphraseEnvKey ?? "CONSTRUCTION_PASSPHRASE"
  return (
    c?.env?.[envKey] ??
    (typeof process !== "undefined" ? process.env?.[envKey] : undefined) ??
    (import.meta as any)?.env?.[envKey]
  )
}

const isModeEnabled = (c: any, options?: ConstructionOptions): boolean => {
  const envKey = options?.modeEnvKey ?? "CONSTRUCTION_MODE"
  const val =
    c?.env?.[envKey] ??
    (typeof process !== "undefined" ? process.env?.[envKey] : undefined) ??
    (import.meta as any)?.env?.[envKey]
  return val === "true" || val === true
}

const encodeBase64Url = (value: Uint8Array): string =>
  btoa(String.fromCharCode(...value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

const decodeBase64Url = (value: string): Uint8Array => {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=")
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
}

const signHmac = async (payload: string, secret: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
  return {
    key,
    signature: await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload))
  }
}

const getContextHelpers = (c: any) => {
  const req = c.req?.raw || c.request || c.req
  const urlObj =
    c.url instanceof URL ? c.url : req?.url ? new URL(req.url) : new URL("http://localhost/")
  const path: string = c.req?.path || urlObj.pathname || "/"
  const method: string = (c.req?.method || req?.method || "GET").toUpperCase()
  const search: string = c.req?.url ? new URL(c.req.url).search : urlObj.search || ""

  const redirect = (target: string) => {
    if (typeof c.redirect === "function") {
      return c.redirect(target)
    }
    const fullTarget = target.startsWith("http")
      ? target
      : new URL(target, urlObj.origin).toString()
    return Response.redirect(fullTarget, 302)
  }

  const json = (data: any, status = 200) => {
    if (typeof c.json === "function") {
      return c.json(data, status)
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    })
  }

  const getCookieValue = (name: string): string | undefined => {
    try {
      const fromHono = getCookie(c, name)
      if (fromHono) return fromHono
    } catch {}

    if (c.cookies?.get) {
      const val = c.cookies.get(name)
      return typeof val === "string" ? val : val?.value
    }

    const cookieHeader = req?.headers?.get?.("cookie") || ""
    const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
    return match ? decodeURIComponent(match[1]) : undefined
  }

  return { path, method, search, redirect, json, getCookieValue }
}

/**
 * Validates whether the incoming request carries a valid, signed construction guest cookie.
 */
export const isConstructionGuest = async (
  c: any,
  options?: ConstructionOptions
): Promise<boolean> => {
  const cookieName = options?.cookieName ?? CONSTRUCTION_GUEST_COOKIE
  const helpers = getContextHelpers(c)
  const token = helpers.getCookieValue(cookieName)
  const passphrase = getPassphrase(c, options)
  if (!token || !passphrase) return false

  try {
    const [encodedPayload, encodedSignature] = token.split(".")
    if (!encodedPayload || !encodedSignature) return false

    const payload = new TextDecoder().decode(decodeBase64Url(encodedPayload))
    const { key } = await signHmac(payload, passphrase)
    const signatureBuffer = decodeBase64Url(encodedSignature)
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer as unknown as BufferSource,
      new TextEncoder().encode(payload)
    )
    return valid && JSON.parse(payload).expiresAt > Date.now()
  } catch {
    return false
  }
}

/**
 * Signs and sets the construction guest cookie on the Hono or Astro context.
 */
export const signInConstructionGuest = async (
  c: any,
  passphrase: string,
  rememberMe = true,
  options?: ConstructionOptions
): Promise<boolean> => {
  const expectedPassphrase = getPassphrase(c, options)
  if (!expectedPassphrase || !passphrase || passphrase !== expectedPassphrase) {
    return false
  }

  const cookieName = options?.cookieName ?? CONSTRUCTION_GUEST_COOKIE
  const maxAge = options?.cookieMaxAge ?? 60 * 60 * 24 * 7 // 7 days

  const payload = JSON.stringify({
    expiresAt: Date.now() + maxAge * 1000
  })

  const { signature } = await signHmac(payload, expectedPassphrase)
  const cookieValue =
    encodeBase64Url(new TextEncoder().encode(payload)) +
    "." +
    encodeBase64Url(new Uint8Array(signature))

  try {
    setCookie(c, cookieName, cookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
      path: "/",
      ...(rememberMe ? { maxAge } : {})
    })
  } catch {
    if (c.cookies?.set) {
      c.cookies.set(cookieName, cookieValue, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        ...(rememberMe ? { maxAge } : {})
      })
    }
  }

  return true
}

const resolveLocale = (path: string, options?: ConstructionOptions): string => {
  if (options?.getLocale) {
    return options.getLocale(path)
  }
  if (options?.locales && options.locales.length > 0) {
    const matched = options.locales.find((loc) => path === `/${loc}` || path.startsWith(`/${loc}/`))
    if (matched) return matched
  }
  // Auto-detection using RFC-5646 language tag pattern at path start (e.g. /en, /en-US, /pt)
  const match = path.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2})?)(\/|$)/)
  return match?.[1]?.toLowerCase() ?? "en"
}

/**
 * Universal Construction Mode Middleware for Hono and Astro.
 *
 * Intercepts unauthenticated traffic when CONSTRUCTION_MODE is active, handles POST requests to the
 * guest auth endpoint automatically, and passes authenticated requests or whitelisted assets
 * cleanly.
 */
export function construction(options: ConstructionOptions = {}) {
  const apiPath = options.apiPath !== undefined ? options.apiPath : "/api/construction-guest"
  const constructionPath = options.constructionPath ?? "/construction"

  return async (c: any, next: any) => {
    const { path, method, search, redirect, json } = getContextHelpers(c)

    // 1. Auto-handle API guest authentication endpoint
    if (apiPath && path === apiPath && method === "POST") {
      try {
        let body: any = {}
        if (typeof c.req?.json === "function") {
          body = await c.req.json().catch(() => ({}))
        } else if (c.request) {
          body = await c.request.json().catch(() => ({}))
        }

        const signedIn = await signInConstructionGuest(
          c,
          body?.passphrase ?? "",
          body?.rememberMe ?? true,
          options
        )

        if (!signedIn) {
          return json({ error: "Invalid credentials" }, 401)
        }
        return json({ success: true })
      } catch (err: any) {
        return json({ error: err?.message || "Authentication failed" }, 400)
      }
    }

    const enabled = isModeEnabled(c, options)
    const locale = resolveLocale(path, options)

    const isConstructionPage =
      path === constructionPath ||
      path === `/${locale}${constructionPath}` ||
      path.endsWith(constructionPath)

    // Helper to check user authorization
    const isAuthorized = async (): Promise<boolean> => {
      if (options.isAuthorized) {
        const customAuth = await options.isAuthorized(c)
        if (customAuth) return true
      }
      const session = c.get?.("session") || c.get?.("user") || c.locals?.session || c.locals?.user
      if (session) return true
      return await isConstructionGuest(c, options)
    }

    // 2. If user visits the construction page directly:
    if (isConstructionPage) {
      if (!enabled || (await isAuthorized())) {
        return redirect(`/${locale}`)
      }
      return next()
    }

    // 3. If construction mode is off, proceed normally
    if (!enabled) {
      return next()
    }

    // 4. Built-in and custom whitelist verification
    const isWhitelisted = DEFAULT_WHITELISTED_PATTERNS.some((pattern) => path.includes(pattern))
    if (isWhitelisted) {
      return next()
    }

    if (options.whitelist) {
      if (typeof options.whitelist === "function") {
        if (options.whitelist(path)) return next()
      } else if (Array.isArray(options.whitelist)) {
        const match = options.whitelist.some((pattern) =>
          typeof pattern === "string" ? path.includes(pattern) : pattern.test(path)
        )
        if (match) return next()
      }
    }

    // 5. Authorized users proceed
    if (await isAuthorized()) {
      return next()
    }

    // 6. Redirect unauthorized users to construction page
    const redirectTo = encodeURIComponent(path + search)
    const targetUrl = `/${locale}${constructionPath}?redirect=${redirectTo}`

    if (options.onUnauthorized) {
      return options.onUnauthorized(c, {
        locale,
        path,
        redirectUrl: targetUrl
      })
    }

    return redirect(targetUrl)
  }
}
