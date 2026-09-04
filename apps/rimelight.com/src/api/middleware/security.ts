import type { APIContext } from "astro"
import { security as astroSecurity } from "@rimelight/security/middleware"
import { getFetchState } from "astro/hono"

const mockGetActionResult: any = () => undefined
const mockCallAction: any = () => Promise.resolve(undefined)

export const security = async (c: any, next: any) => {
  await next()
  if (!c.res) return

  const state = getFetchState(c)
  const context: APIContext = {
    request: c.req.raw,
    url: new URL(c.req.url),
    redirect: (path: string, status?: number) => c.redirect(path, status ?? 302),
    locals: state?.locals ?? {},
    cookies: state?.cookies as any,
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

  const response = await astroSecurity(context, async () => c.res)
  if (response instanceof Response) {
    c.res = response
  }
}
