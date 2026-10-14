import type { Context } from "hono";
import { handleOgRequest, type OgHandlerOptions } from "./handler";

export type HonoContext = Context;

/**
 * Creates a Hono route handler for dynamic OG cards.
 *
 * @example
 *   ;```ts
 *   import { createHonoOgHandler } from "@rimelight/seo/og"
 *   app.get("/open-graph/*", createHonoOgHandler())
 *   ```
 */
export function createHonoOgHandler(options: OgHandlerOptions = {}) {
  return async function handleOg(c: Context): Promise<Response> {
    return handleOgRequest(c.req.raw, options);
  };
}
