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
   * Additional prefixes or path matchers to route to the CMS handler.
   * Defaults to ["/api/content", "/api/search", "/content", "/search"].
   */
  prefixes?: string[] | undefined;
  /**
   * Optional custom CmsRouter instance.
   */
  router?: CmsRouterType | undefined;
}

/**
 * Hono middleware that serves Rimelight CMS REST endpoints, content delivery,
 * search, and MCP endpoints.
 *
 * @example
 *   import { cms } from "@rimelight/cms/middleware";
 *   app.use(cms());
 */
export function cms(options: CmsMiddlewareOptions = {}): MiddlewareHandler {
  let virtualConfig: any = {};
  let virtualDb: any = undefined;
  try {
    virtualConfig = (virtualCms as any)?.config ?? {};
    virtualDb = (virtualCms as any)?.db;
  } catch {
    // Ignore if virtual:rimelight-cms doesn't provide these exports
  }
  const primaryPrefix = options.prefix ?? virtualConfig.routePrefix ?? "/api/cms";
  const supportedPrefixes = options.prefixes ?? [
    primaryPrefix,
    "/api/content",
    "/api/search",
    "/content",
    "/search",
  ];
  let activeRouter: CmsRouterType | null = options.router ?? null;

  return async (c, next) => {
    const { pathname } = new URL(c.req.url);
    const matchesPrefix = supportedPrefixes.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

    if (matchesPrefix) {
      if (!activeRouter) {
        const db = options.db ?? virtualDb ?? (c.env as any)?.DB;
        activeRouter = createCmsRouter({
          ...options,
          prefix: primaryPrefix,
          db,
        });
      }

      // Normalize pathname for router if called directly under /api/...
      let reqToFetch = c.req.raw;
      if (
        pathname.startsWith("/api/content") ||
        pathname.startsWith("/api/search") ||
        pathname.startsWith("/api/cms")
      ) {
        const url = new URL(c.req.url);
        url.pathname = pathname.replace(/^\/api/, "");
        reqToFetch = new Request(url.toString(), c.req.raw);
      }

      let execCtx: any = undefined;
      try {
        execCtx = c.executionCtx;
      } catch {
        // Ignored if executionCtx is not present in environment
      }

      return activeRouter.fetch(reqToFetch, c.env, execCtx);
    }
    return await next();
  };
}

export { cmsRouter, type CmsRouterType };
