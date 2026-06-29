import { defineMiddleware } from "astro:middleware"
import { auth } from "@/auth/auth.ts"
import { languages } from "@/config/i18n.config.ts"

// Routes to be skipped by this middleware
const WHITELISTED_ROUTES = ["/construction", "/api/auth"]

// If construction mode is enabled, redirects any non-whitelisted page to `construction.astro`
export const construction = defineMiddleware(async (context, next) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  if (!constructionMode) {
    if (context.url.pathname.includes("/construction")) {
      return context.redirect("/")
    }
    return next()
  }

  const isSkippedPath = WHITELISTED_ROUTES.some((path) => context.url.pathname.includes(path))
  if (isSkippedPath) {
    if (context.url.pathname.includes("/construction")) {
      const session = await auth.api.getSession({ headers: context.request.headers })
      if (session) {
        return context.redirect("/")
      }
    }
    return next()
  }

  const session = await auth.api.getSession({ headers: context.request.headers })
  if (session) {
    return next()
  }

  const localePrefix = languages.find((loc) => context.url.pathname.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(context.url.pathname + context.url.search)
  return context.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
})
