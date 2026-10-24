import type { Plugin } from "vite-plus";
import type { CmsConfig } from "./types";

const ID = "virtual:rimelight-cms";
const RESOLVED_ID = `\0${ID}`;

// The virtual module ID emitted by filesystem-routing/vite. We reference it
// by its stable string value rather than importing from filesystem-routing
// so that the CMS package doesn't need it as a dependency.
const FILE_ROUTES_VIRTUAL_ID = "virtual:file-routes";

/**
 * Generates the CMS route entries to be injected into the pageRoutes export
 * that filesystem-routing emits. Each entry matches the shape expected by @solidjs/router's fileRoutes():
 * `$component` with `require` or `import`.
 */
function buildCmsRouteEntries(basePath: string): string {
  const base = basePath.replace(/\/$/, "");
  const paths = [`${base}/:locale/cms/*`, `${base}/:locale/cms`, `${base}/cms/*`, `${base}/cms`];

  return paths
    .map(
      (path) =>
        `{ path: ${JSON.stringify(path)}, id: ${JSON.stringify(path)}, page: true, $component: { src: "/node_modules/@rimelight/cms/src/solid/index.ts", import: () => import("@rimelight/cms/solid").then(m => ({ default: m.CmsDashboard })) } }`,
    )
    .join(",\n  ");
}

export const cms = (options: CmsConfig = {}): Plugin => ({
  name: "rimelight:cms",
  resolveId(id) {
    if (id === ID) return RESOLVED_ID;
    return undefined;
  },
  async load(id) {
    if (id !== RESOLVED_ID) return undefined;
    return [
      `export const db = undefined;`,
      `export const config = ${JSON.stringify(options)};`,
    ].join("\n");
  },
  transform(code, id) {
    // Intercept the filesystem-routing virtual module and inject CMS routes
    // into its pageRoutes export so consumers get CMS routes automatically.
    if (id !== FILE_ROUTES_VIRTUAL_ID) return undefined;

    const basePath = options.routePrefix ?? "";
    const entries = buildCmsRouteEntries(basePath);

    // The virtual module ends with:
    //   export const pageRoutes = [...];
    // We prepend our CMS entries to that array.
    return code.replace(
      /export const pageRoutes = \[/,
      `export const pageRoutes = [\n  ${entries},`,
    );
  },
});
