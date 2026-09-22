import { handleOgRequest, type OgHandlerOptions } from "./handler.js"

export interface AstroApiContext {
  request: Request
  [key: string]: unknown
}

/**
 * Creates an Astro API route GET handler for dynamic OG cards.
 *
 * @example
 * ```ts
 * // src/pages/open-graph/[...route].png.ts
 * import { createAstroOgHandler } from "@rimelight/seo/og"
 * export const GET = createAstroOgHandler()
 * ```
 */
export function createAstroOgHandler(options: OgHandlerOptions = {}) {
  return async function GET(context: AstroApiContext): Promise<Response> {
    return handleOgRequest(context.request, options)
  }
}
