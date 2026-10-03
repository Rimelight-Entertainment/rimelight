import { cmsRouter, type CmsRouterType } from "../server/router";

export interface CmsMiddlewareOptions {
  /**
   * Path prefix where the CMS API router is served.
   * Defaults to "/api/cms".
   */
  prefix?: string | undefined;
}

/**
 * Universal Rimelight CMS middleware for Hono edge runtimes.
 * Automatically serves REST & MCP endpoints for Rimelight CMS under `/api/cms`.
 *
 * @example
 *   import { cms } from "@rimelight/cms/middleware";
 *   app.use(cms());
 */
export function cms(options: CmsMiddlewareOptions = {}) {
  const prefix = options.prefix ?? "/api/cms";
  return async (c: any, next: () => Promise<any>): Promise<any> => {
    const rawUrl = c?.req?.url || "http://localhost/";
    const url = new URL(rawUrl);
    if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
      return cmsRouter.fetch(c.req.raw, c.env, c.executionCtx);
    }
    return await next();
  };
}

export { cmsRouter, type CmsRouterType };
export default cms;
