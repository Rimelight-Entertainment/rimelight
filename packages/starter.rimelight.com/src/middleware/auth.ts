import { defineMiddleware } from "astro:middleware"
import { env } from "cloudflare:workers"
import { auth as betterAuth } from "@/auth/auth"

// Routes to be skipped by this middleware
const WHITELISTED_ROUTES: string[] = []

// Routes that require authentication
const PROTECTED_ROUTES: string[] = ["/admin", "/dashboard"]

// Static path redirects
const REDIRECT_ROUTES: Record<string, string> = {
  "/auth": "/auth/sign-in"
}

// Manages database/blob bindings, resolves user sessions, and enforces access control rules
export const auth = defineMiddleware(async (context, next) => {
  // Bind environment variables/resources to globals if present
  const bindings = env as Record<string, any>
  if (bindings?.DB) {
    globalThis.DB = bindings.DB
  }
  if (bindings?.BLOB) {
    globalThis.BLOB = bindings.BLOB
  }

  const isSkippedPath = WHITELISTED_ROUTES.some((path) => context.url.pathname.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => context.url.pathname.startsWith(path))

  // Populate user and session in context locals
  if (isSkippedPath) {
    context.locals.user = null
    context.locals.session = null
  } else {
    const session = await betterAuth.api.getSession({ headers: context.request.headers })
    context.locals.user = session?.user ?? null
    context.locals.session = session?.session ?? null
  }

  // Handle static redirects
  const staticRedirect = REDIRECT_ROUTES[context.url.pathname]
  if (staticRedirect) {
    return context.redirect(staticRedirect)
  }

  // Enforce access control for admin routes
  if (context.url.pathname.includes("/admin")) {
    if (!context.locals.session) {
      return context.redirect("/auth/sign-in")
    }
    const user = context.locals.user as (import("better-auth").User & { role?: string }) | null
    if (user?.role !== "admin") {
      return new Response("Forbidden", { status: 403 })
    }
  }

  const isAuthPage = context.url.pathname === "/auth/sign-in" || context.url.pathname === "/auth/sign-up"
  if (isAuthPage && context.locals.session) {
    return context.redirect("/")
  }

  if (isProtected && !context.locals.session) {
    return context.redirect("/auth/sign-in")
  }

  return next()
})
