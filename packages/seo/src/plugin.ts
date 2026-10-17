import type { Plugin } from "vite-plus";
import type { SeoConfig } from "./types";
import { createSeoContext, setupSeoDevServer, emitSeoBundleAssets } from "./server";

const ID = "virtual:rimelight-seo";
const RESOLVED_ID = `\0${ID}`;

/**
 * Consolidated Vite Plugin orchestrating SEO in-memory virtual modules,
 * dev-server asset middleware, and production static asset generation.
 */
export function seo(options: SeoConfig = {}): Plugin {
  const ctx = createSeoContext(options);

  return {
    name: "rimelight:seo",
    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
    load: (id) =>
      id === RESOLVED_ID
        ? `export const config = ${JSON.stringify(ctx.normalizedSiteConfig)};`
        : undefined,
    configureServer: (server: any) => setupSeoDevServer(server, options, ctx),
    generateBundle: function () {
      return emitSeoBundleAssets(this, options, ctx);
    },
  };
}
