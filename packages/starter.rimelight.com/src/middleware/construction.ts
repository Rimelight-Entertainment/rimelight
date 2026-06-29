import { defineMiddleware } from "astro:middleware"
import { auth } from "@/auth/auth.ts"
import { languages } from "@/config/i18n.config.ts"

// Routes to be skipped by this middleware
const WHITELISTED_ROUTES = ["/construction", "/api/auth"]

// Static path redirects when construction mode is disabled or user is authenticated
const REDIRECT_ROUTES: Record<string, string> = {
  "/construction": "/"
}

// If construction mode is enabled, redirects any non-whitelisted page to `construction.astro`
export const construction = defineMiddleware(async (context, next) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  const redirectKey = Object.keys(REDIRECT_ROUTES).find((path) => context.url.pathname.includes(path))
  const targetRedirect = redirectKey ? REDIRECT_ROUTES[redirectKey] : undefined

  // Redirect users away from the construction page if mode is off or they are already authenticated
  if (targetRedirect) {
    if (!constructionMode) {
      return context.redirect(targetRedirect)
    }
    const session = await auth.api.getSession({ headers: context.request.headers })
    if (session) {
      return context.redirect(targetRedirect)
    }
    return next()
  }

  // If construction mode is off, proceed normally
  if (!constructionMode) {
    return next()
  }

  // Bypass wall for whitelisted routes (e.g., auth pages, api endpoints)
  const isSkippedPath = WHITELISTED_ROUTES.some((path) => context.url.pathname.includes(path))
  if (isSkippedPath) {
    return next()
  }

  // Bypass wall if user is already authenticated
  const session = await auth.api.getSession({ headers: context.request.headers })
  if (session) {
    return next()
  }

  // Redirect unauthenticated users to the construction page
  const localePrefix = languages.find((loc) => context.url.pathname.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(context.url.pathname + context.url.search)
  return context.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
})
