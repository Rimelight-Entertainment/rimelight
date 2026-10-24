import type { MiddlewareHandler } from "hono";
import * as virtualCms from "virtual:rimelight-cms";
import { createCmsRouter, cmsRouter, type CmsRouterType } from "../server/router";
import { migrateCms } from "../migrator";

/**
 * Hono middleware that serves Rimelight CMS REST endpoints, content delivery,
 * search, and MCP endpoints.
 *
 * Takes no options — all configuration lives in the Vite plugin
 * (`cms({...})` from "@rimelight/cms/plugin") and is read via `virtual:rimelight-cms`.
 *
 * @example
 *   import { cms } from "@rimelight/cms/middleware";
 *   app.use(cms());
 */
export function cms(): MiddlewareHandler {
  let virtualConfig: any = {};
  let virtualDb: any = undefined;
  try {
    virtualConfig = (virtualCms as any)?.config ?? {};
    virtualDb = (virtualCms as any)?.db;
  } catch {
    // Ignore if virtual:rimelight-cms doesn't provide these exports
  }
  const primaryPrefix = virtualConfig.routePrefix ?? "/api/cms";
  const supportedPrefixes = [primaryPrefix, "/api/content", "/api/search", "/content", "/search"];
  let activeRouter: CmsRouterType | null = null;
  let migrationRunPromise: Promise<any> | null = null;

  return async (c, next) => {
    const { pathname } = new URL(c.req.url);
    const matchesPrefix = supportedPrefixes.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    );

    if (matchesPrefix) {
      const db = virtualDb ?? (c.env as any)?.DB;

      // Auto-migrate is configured via the Vite plugin: cms({ autoMigrate: true })
      if (virtualConfig.autoMigrate === true && db && !migrationRunPromise) {
        migrationRunPromise = migrateCms(db).catch((err) => {
          console.error("[@rimelight/cms autoMigrate Error]:", err);
        });
      }
      if (migrationRunPromise) {
        await migrationRunPromise;
      }

      if (!activeRouter) {
        activeRouter = createCmsRouter({
          prefix: primaryPrefix,
          db,
          dev: virtualConfig.dev,
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
