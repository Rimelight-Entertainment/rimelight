import { defineMiddleware } from "astro:middleware"
import { languages } from "@/config/i18n.config.ts"

// Routes to be skipped by this middleware
const WHITELIST = ["/construction", "/auth", "/api/auth"]

// If construction mode is enabled, redirects any non-whitelisted page to `construction.astro`
export const construction = defineMiddleware(async (context, next) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  if (!constructionMode) {
    return next()
  }

  const isSkippedPath = WHITELIST.some((path) => context.url.pathname.includes(path))
  if (isSkippedPath) {
    return next()
  }

  const { auth } = await import("@/auth/auth")
  const session = await auth.api.getSession({ headers: context.request.headers })
  if (session) {
    return next()
  }

  const localePrefix = languages.find((loc) => context.url.pathname.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(context.url.pathname + context.url.search)
  return context.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
})
