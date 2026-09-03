import { auth } from "@/auth/auth"
import { isConstructionGuest } from "@/auth/construction-guest"
import { getFetchState } from "astro/hono"

const IGNORED_ROUTES = ["/docs/"]
const PROTECTED_ROUTES = ["/internal"]

export const authMiddleware = async (c: any, next: any) => {
  const url = new URL(c.req.url)

  // Fast-path bypass for static assets and client scripts to avoid interference with CSS/JS/images
  const isStaticAsset =
    url.pathname.startsWith("/_astro/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/open-graph/") ||
    /\.(css|js|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico)$/i.test(url.pathname)

  if (isStaticAsset) {
    return await next()
  }

  const isIgnored = IGNORED_ROUTES.some((path) => url.pathname.includes(path))
  const isProtected = PROTECTED_ROUTES.some((path) => url.pathname.startsWith(path))

  if (isIgnored) {
    c.set("user", null)
    c.set("session", null)
    try {
      const state = getFetchState(c)
      if (state && state.locals) {
        state.locals.user = null
        state.locals.session = null
      }
    } catch {}
  } else {
    let sessionCtx = null
    try {
      sessionCtx = await auth.getSession(c.req.raw)
    } catch (err) {
      console.error("[authMiddleware] Failed to resolve session:", err)
    }

    const guest = !sessionCtx && (await isConstructionGuest(c))

    const user =
      sessionCtx ??
      (guest
        ? {
            userId: "construction-guest",
            email: "guest",
            name: "Guest",
            roles: ["guest"],
            permissions: [],
            userType: "user" as const,
            metadata: {}
          }
        : null)

    const session = sessionCtx
      ? {
          id: sessionCtx.userId,
          userId: sessionCtx.userId,
          roles: sessionCtx.roles,
          userType: sessionCtx.userType
        }
      : guest
        ? {
            id: "construction-guest",
            userId: "construction-guest",
            roles: ["guest"],
            userType: "user"
          }
        : null

    c.set("user", user)
    c.set("session", session)

    try {
      const state = getFetchState(c)
      if (state && state.locals) {
        state.locals.user = user ? { ...user, id: user.userId } : null
        state.locals.session = session
      }
    } catch {
      // Ignore in non-Astro context
    }
  }

  const session = c.get("session")
  const user = c.get("user")
  const isApi = url.pathname.startsWith("/api/")

  if (url.pathname === "/auth") {
    return c.redirect("/api/auth/login")
  }

  if ((url.pathname === "/auth/sign-in" || url.pathname === "/auth/sign-up") && session) {
    return c.redirect("/")
  }

  if (isProtected && !session) {
    if (isApi) {
      return c.json({ error: "Unauthorized", message: "Authentication required." }, 401)
    }
    return c.redirect("/api/auth/login")
  }

  if (url.pathname.startsWith("/internal") || url.pathname.startsWith("/api/internal")) {
    if (!session) {
      if (isApi) {
        return c.json({ error: "Unauthorized", message: "Authentication required." }, 401)
      }
      return c.redirect("/api/auth/login")
    }
    const roles: string[] = user?.roles ?? []
    const isStaff =
      user?.userType === "employee" ||
      roles.some((r: string) => ["employee", "staff", "admin", "owner"].includes(r.toLowerCase()))
    if (!isStaff) {
      if (isApi) {
        return c.json({ error: "Forbidden", message: "Employee access required." }, 403)
      }
      return c.redirect("/")
    }
  }

  if (url.pathname.includes("/construction") && session) {
    return c.redirect("/")
  }

  return await next()
}
