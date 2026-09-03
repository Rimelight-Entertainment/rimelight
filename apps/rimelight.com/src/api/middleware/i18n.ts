import { i18n as astroI18n } from "@rimelight/i18n/middleware"
import { getFetchState } from "astro/hono"

export const i18n = async (c: any, next: any) => {
  const url = new URL(c.req.url)
  const isStaticAsset =
    url.pathname.startsWith("/_astro/") ||
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/favicon.ico" ||
    url.pathname.startsWith("/open-graph/") ||
    /\.(css|js|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico)$/i.test(url.pathname)

  if (isStaticAsset) {
    return await next()
  }

  const context = {
    request: c.req.raw,
    url,
    redirect: (path: string, status?: number) => {
      return c.redirect(path, status ?? 302)
    },
    locals: getFetchState(c).locals
  }
  const response = await astroI18n(context, async () => {
    await next()
    return c.res
  })
  if (response instanceof Response && response !== c.res) {
    c.res = response
  }
}
