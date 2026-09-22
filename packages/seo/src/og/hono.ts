import { handleOgRequest, type OgHandlerOptions } from "./handler.js"

export interface HonoContext {
  req: {
    raw: Request
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * Creates a Hono route handler for dynamic OG cards.
 *
 * @example
 * ```ts
 * import { createHonoOgHandler } from "@rimelight/seo/og"
 * app.get("/open-graph/*", createHonoOgHandler())
 * ```
 */
export function createHonoOgHandler(options: OgHandlerOptions = {}) {
  return async function handleOg(c: HonoContext): Promise<Response> {
    return handleOgRequest(c.req.raw, options)
  }
}
