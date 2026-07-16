import { getFetchState } from "astro/hono"
import { env } from "cloudflare:workers"
import { auth as betterAuth } from "@/auth/auth"
import type { Context } from "hono"

// Routes to be skipped by this middleware
const WHITELISTED_ROUTES: string[] = []

// Routes that require authentication
const PROTECTED_ROUTES: string[] = ["/admin", "/dashboard"]

// Static path redirects
const REDIRECT_ROUTES: Record<string, string> = {
  "/auth": "/auth/sign-in"
}

// Manages database/blob bindings, resolves user sessions, and enforces access control rules
export const auth = async (c: Context<{ Bindings: ENV }>, next: any) => {
  // Bind environment variables/resources to globals if present
  const bindings = c.env ?? env
  if (bindings?.DB) {
    globalThis.DB = bindings.DB
  }
  if (bindings?.BLOB) {
    globalThis.BLOB = bindings.BLOB
  }

  const isSkippedPath = WHITELISTED_ROUTES.some((path) => c.req.path.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => c.req.path.startsWith(path))

  const state = getFetchState(c)

  // Populate user and session in context locals
  if (isSkippedPath) {
    state.locals.user = null
    state.locals.session = null
  } else {
    const session = await betterAuth.api.getSession({ headers: c.req.raw.headers })
    state.locals.user = session?.user ?? null
    state.locals.session = session?.session ?? null
  }

  // Handle static redirects
  const staticRedirect = REDIRECT_ROUTES[c.req.path]
  if (staticRedirect) {
    return c.redirect(staticRedirect)
  }

  // Enforce access control for admin routes
  if (c.req.path.includes("/admin")) {
    if (!state.locals.session) {
      return c.redirect("/auth/sign-in")
    }
    const user = state.locals.user
    if (user?.role !== "admin") {
      return c.text("Forbidden", 403)
    }
  }

  const isAuthPage = c.req.path === "/auth/sign-in" || c.req.path === "/auth/sign-up"
  if (isAuthPage && state.locals.session) {
    return c.redirect("/")
  }

  if (isProtected && !state.locals.session) {
    return c.redirect("/auth/sign-in")
  }

  return await next()
}
