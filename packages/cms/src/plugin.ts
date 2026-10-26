import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite-plus";
import type { CmsPluginOptions } from "./types";

const ID = "virtual:rimelight-cms";
const RESOLVED_ID = `\0${ID}`;
/** Emitted by `filesystem-routing/vite`; referenced by string so it isn't a dependency. */
const FILE_ROUTES_ID = "virtual:file-routes";

function dashboardRoutes(base: string, moduleId: string): string {
  const root = base.replace(/\/$/, "") || "/cms";
  const paths = [`/:locale${root}/*rest`, `/:locale${root}`, `${root}/*rest`, root];
  return paths
    .map(
      (path) =>
        `{ path: ${JSON.stringify(path)}, id: ${JSON.stringify(`rimelight-cms:${path}`)}, page: true, $component: { src: ${JSON.stringify(moduleId)}, import: () => import(${JSON.stringify(moduleId)}).then((m) => ({ default: m.CmsDashboardRoute })) } }`,
    )
    .join(",\n  ");
}

/**
 * Vite plugin: exposes `cms.config.ts` + options as `virtual:rimelight-cms` and mounts the
 * dashboard routes into filesystem-routing.
 */
export const cms = (options: CmsPluginOptions = {}): Plugin => {
  let configPath: string | null = null;
  const dashboardPath = options.dashboardPath ?? "/cms";

  return {
    name: "rimelight:cms",
    configResolved(config: any) {
      const candidate = resolve(config.root, options.config ?? "cms.config.ts");
      configPath = existsSync(candidate) ? candidate : null;
      if (options.config && !configPath) {
        throw new Error(`[@rimelight/cms] config file not found: ${candidate}`);
      }
    },
    resolveId(id) {
      return id === ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const { auth: _auth, ...serializable } = options;
      const opts = JSON.stringify({
        ...serializable,
        dashboardPath,
        apiPath: options.apiPath ?? "/api/cms",
      });
      return configPath
        ? `import config from ${JSON.stringify(configPath)};\nexport { config };\nexport const options = ${opts};`
        : `export const config = {};\nexport const options = ${opts};`;
    },
    async transform(code, id) {
      if (id !== FILE_ROUTES_ID && id !== `\0${FILE_ROUTES_ID}`) return undefined;
      // Bare specifiers inside a virtual module don't resolve in the browser, so emit the
      // resolved file path (the same form filesystem-routing uses for app routes).
      const resolved = await this.resolve("@rimelight/cms/dashboard/route");
      if (!resolved)
        throw new Error("[@rimelight/cms] cannot resolve @rimelight/cms/dashboard/route");
      const moduleId = resolved.id.replace(/\\/g, "/");
      return {
        code: code.replace(
          /export const pageRoutes = \[/,
          `export const pageRoutes = [\n  ${dashboardRoutes(dashboardPath, moduleId)},`,
        ),
        map: { mappings: "" },
      };
    },
  };
};

export type { CmsPluginOptions };
