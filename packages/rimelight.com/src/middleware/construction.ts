import { getFetchState } from "astro/hono"
import { languages } from "@/config/i18n.config"

// Routes to be skipped by this middleware
const WHITELISTED_ROUTES = ["/construction", "/api/auth"]

// If construction mode is enabled, redirects any non-whitelisted page to `construction.astro`
export const construction = async (c: any, next: any) => {
  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  if (!constructionMode) {
    if (c.req.path.includes("/construction")) {
      return c.redirect("/")
    }
    return next()
  }

  const state = getFetchState(c)

  const isSkippedPath = WHITELISTED_ROUTES.some((path) => c.req.path.includes(path))
  if (isSkippedPath) {
    if (c.req.path.includes("/construction")) {
      if (state.locals.session) {
        return c.redirect("/")
      }
    }
    return next()
  }

  if (state.locals.session) {
    return next()
  }

  const localePrefix = languages.find((loc) => c.req.path.startsWith(`/${loc}/`)) ?? "en"
  const redirectTo = encodeURIComponent(c.req.path + new URL(c.req.url).search)
  return c.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
}
