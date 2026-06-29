import { getFetchState } from "astro/hono"
import { languages } from "@/config/i18n.config"

// Routes to be skipped by this middleware
const WHITELISTED_ROUTES = ["/construction", "/api/auth"]

// Static path redirects when construction mode is disabled or user is authenticated
const REDIRECT_ROUTES: Record<string, string> = {
  "/construction": "/"
}

// If construction mode is enabled, redirects any non-whitelisted page to `construction.astro`
export const construction = async (c: any, next: any) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  const redirectKey = Object.keys(REDIRECT_ROUTES).find((path) => c.req.path.includes(path))
  const targetRedirect = redirectKey ? REDIRECT_ROUTES[redirectKey] : undefined

  const state = getFetchState(c)

  // Redirect users away from the construction page if mode is off or they are already authenticated
  if (targetRedirect) {
    if (!constructionMode) {
      return c.redirect(targetRedirect)
    }
    if (state.locals.session) {
      return c.redirect(targetRedirect)
    }
    return next()
  }

  // If construction mode is off, proceed normally
  if (!constructionMode) {
    return next()
  }

  // Bypass wall for whitelisted routes (e.g., auth pages, api endpoints)
  const isSkippedPath = WHITELISTED_ROUTES.some((path) => c.req.path.includes(path))
  if (isSkippedPath) {
    if (c.req.path.includes("/construction")) {
      if (state.locals.session) {
        return c.redirect("/")
      }
    }
    return next()
  }

  // Bypass wall if user is already authenticated
  if (state.locals.session) {
    return next()
  }

  // Redirect unauthenticated users to the construction page
  const localePrefix = languages.find((loc) => c.req.path.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(c.req.path + new URL(c.req.url).search)
  return c.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
}
