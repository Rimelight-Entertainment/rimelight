import type { MiddlewareHandler } from "hono";
import * as virtualCms from "virtual:rimelight-cms";
import {
  createCmsRouter,
  cmsRouter,
  type CmsRouterOptions,
  type CmsRouterType,
} from "../server/router";

export interface CmsMiddlewareOptions extends CmsRouterOptions {
  /**
   * Path prefix where the CMS API router is served.
   * Defaults to "/api/cms".
   */
  prefix?: string | undefined;
  /**
   * Optional custom CmsRouter instance.
   */
  router?: CmsRouterType | undefined;
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
  const virtualConfig = (virtualCms as any)?.config ?? {};
  const virtualDb = (virtualCms as any)?.db;
  const prefix = options.prefix ?? virtualConfig.routePrefix ?? "/api/cms";
  let activeRouter: CmsRouterType | null = options.router ?? null;

  return async (c, next) => {
    const { pathname } = new URL(c.req.url);
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      if (!activeRouter) {
        const db = options.db ?? virtualDb ?? (c.env as any)?.DB;
        activeRouter = createCmsRouter({
          ...options,
          prefix,
          db,
        });
      }
      return activeRouter.fetch(c.req.raw, c.env, c.executionCtx);
    }
    return await next();
  };
}

export { cmsRouter, type CmsRouterType };
