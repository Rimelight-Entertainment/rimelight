import type { MiddlewareHandler } from "hono";
import { config, options } from "virtual:rimelight-cms";
import { createCmsApi } from "../server/router";
import { migrateCms } from "../migrator/index";
import { getCmsDb } from "../db/index";

/**
 * Hono middleware serving the CMS API (`/api/cms/*`), public content (`/api/content/*`) and
 * search (`/api/search`). Configuration comes from the Vite plugin and `cms.config.ts`.
 *
 * @example
 *   import { cms } from "@rimelight/cms/middleware";
 *   app.use(cms());
 */
export function cms(): MiddlewareHandler {
  // Plugin-level `storage` overrides the config file's, so the bucket can be set in vite.config.ts.
  const cmsConfig = {
    ...config,
    ...(options.storage ? { storage: options.storage } : {}),
  };
  const api = createCmsApi({
    config: cmsConfig,
    apiPath: (options.apiPath ?? "/api/cms").replace(/\/$/, ""),
    ...(options.devBypassAuth ? { devBypassAuth: true } : {}),
  });
  const apiPath = (options.apiPath ?? "/api/cms").replace(/\/$/, "");
  const apiRoot = apiPath.replace(/\/cms$/, "");
  const prefixes = [apiPath, `${apiRoot}/content`, `${apiRoot}/search`];
  let ready: Promise<void> | null = null;

  const bootstrap = async (c: any) => {
    if (!options.autoMigrate) return;
    const { db } = getCmsDb({}, c);
    await migrateCms(c.env?.DB ?? db);
  };

  return async (c, next) => {
    const { pathname } = new URL(c.req.url);
    if (!prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return next();

    ready ??= bootstrap(c).catch((err) => {
      ready = null; // retry on the next request
      console.error("[@rimelight/cms] bootstrap failed:", err);
    }) as Promise<void>;
    await ready;

    const url = new URL(c.req.url);
    url.pathname = pathname.slice(apiRoot.length) || "/";
    let executionCtx: any;
    try {
      executionCtx = c.executionCtx;
    } catch {}
    return api.fetch(new Request(url, c.req.raw), c.env, executionCtx);
  };
}
