import type { MiddlewareHandler } from "hono";
import { config, options } from "virtual:rimelight-cms";
import { createCmsApi } from "../server/router";
import { migrateCms } from "../migrator/index";
import { getCmsDb } from "../db/index";
import { createCms } from "../services/index";
import { createCmsContext } from "../services/context";

/**
 * Hono middleware serving the CMS API (`/api/cms/*`), public content (`/api/content/*`) and
 * search (`/api/search`). Configuration comes from the Vite plugin and `cms.config.ts`.
 *
 * @example
 *   import { cms } from "@rimelight/cms/middleware";
 *   app.use(cms());
 */
export function cms(): MiddlewareHandler {
  const api = createCmsApi({
    config,
    ...(options.devBypassAuth ? { devBypassAuth: true } : {}),
  });
  const apiPath = (options.apiPath ?? "/api/cms").replace(/\/$/, "");
  const apiRoot = apiPath.replace(/\/cms$/, "");
  const prefixes = [apiPath, `${apiRoot}/content`, `${apiRoot}/search`];
  let ready: Promise<void> | null = null;

  const bootstrap = async (c: any) => {
    const { db, dialect } = getCmsDb({}, c);
    if (options.autoMigrate) await migrateCms(c.env?.DB ?? db);
    if (config.templates?.length) {
      const ctx = createCmsContext({ db, dialect, collections: config.collections ?? [] });
      await createCms(ctx).templates.seedTemplates(config.templates);
    }
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
