import type { MiddlewareHandler } from "hono";
import { cmsRouter, type CmsRouterType } from "../server/router";

export interface CmsMiddlewareOptions {
  /**
   * Path prefix where the CMS API router is served.
   * Defaults to "/api/cms".
   */
  prefix?: string | undefined;
}

/**
 * Hono middleware that serves the Rimelight CMS REST & MCP endpoints
 * under `/api/cms`.
 *
 * @example
 *   import { cms } from "@rimelight/cms/middleware";
 *   app.use(cms());
 */
export function cms(options: CmsMiddlewareOptions = {}): MiddlewareHandler {
  const prefix = options.prefix ?? "/api/cms";
  return async (c, next) => {
    const { pathname } = new URL(c.req.url);
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return cmsRouter.fetch(c.req.raw, c.env, c.executionCtx);
    }
    return await next();
  };
}

export { cmsRouter, type CmsRouterType };
