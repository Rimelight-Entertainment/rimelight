import { languages } from "@/config/i18n.config"

const WHITELISTED_ROUTES = ["/construction", "/api/auth", "/api/construction-guest"]

const getLocaleFromPath = (path: string) => {
  return languages.find((loc) => path === `/${loc}` || path.startsWith(`/${loc}/`)) ?? "en"
}
export const construction = async (c: any, next: any) => {
  const url = new URL(c.req.url)
  const isStaticAsset =
    url.pathname.startsWith("/_astro/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/open-graph/") ||
    /\.(css|js|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico)$/i.test(url.pathname)

  if (isStaticAsset) {
    return next()
  }

  const constructionMode =
    (import.meta.env.CONSTRUCTION_MODE ?? process.env.CONSTRUCTION_MODE) === "true"

  const session = c.get("session")
  const localePrefix = getLocaleFromPath(c.req.path)

  const isConstructionPage =
    c.req.path === `/${localePrefix}/construction` || c.req.path === "/construction"

  if (isConstructionPage) {
    if (!constructionMode || session) {
      return c.redirect(`/${localePrefix}`)
    }
    return next()
  }

  if (!constructionMode) {
    return next()
  }

  const isSkippedPath = WHITELISTED_ROUTES.some((path) => c.req.path.includes(path))
  if (isSkippedPath) {
    return next()
  }

  if (session) {
    return next()
  }

  const redirectTo = encodeURIComponent(c.req.path + new URL(c.req.url).search)
  return c.redirect(`/${localePrefix}/construction?redirect=${redirectTo}`)
}
