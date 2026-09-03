import type { APIContext } from "astro"
import { security as astroSecurity } from "@rimelight/security/middleware"
import { getFetchState } from "astro/hono"

const mockGetActionResult: any = () => undefined
const mockCallAction: any = () => Promise.resolve(undefined)

export const security = async (c: any, next: any) => {
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

  const state = getFetchState(c)
  const context: APIContext = {
    request: c.req.raw,
    url,
    redirect: (path: string, status?: number) => c.redirect(path, status ?? 302),
    locals: state.locals,
    cookies: state.cookies,
    site: undefined,
    generator: "",
    clientAddress: "",
    session: undefined,
    cache: {
      enabled: false,
      set() {},
      tags: [],
      options: Object.freeze({}),
      invalidate() {
        return Promise.resolve()
      }
    },
    originPathname: new URL(c.req.url).pathname,
    params: {},
    props: {},
    preferredLocale: undefined,
    preferredLocaleList: undefined,
    currentLocale: undefined,
    isPrerendered: false,
    routePattern: "",
    csp: {
      insertDirective() {},
      insertStyleResource() {},
      insertStyleHash() {},
      insertScriptResource() {},
      insertScriptHash() {}
    },
    logger: { info() {}, warn() {}, error() {} },
    getActionResult: mockGetActionResult,
    callAction: mockCallAction,
    rewrite: async () => new Response()
  }
  const response = await astroSecurity(context, async () => {
    await next()
    return c.res
  })
  if (response instanceof Response && response !== c.res) {
    c.res = response
  }
}
