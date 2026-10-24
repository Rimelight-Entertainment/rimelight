import path from "node:path";
import type { Plugin } from "vite-plus";
import { extractAllMeta } from "./extractAll";

const ID = "virtual:rimelight-ui-docs-meta";
const RESOLVED = `\0${ID}`;

/**
 * TEMPORARY: serves `virtual:rimelight-ui-docs-meta` (props / slots / theme of every RL
 * component, extracted from packages/ui) to the docs pages.
 *
 * The website shouldn't parse another package's sources. The plan is for @rimelight/ui to
 * generate this metadata at build time and export it (e.g. `@rimelight/ui/meta`); then this
 * plugin and src/docs/extract* go away.
 */
export function uiDocsMeta(): Plugin {
  let uiRoot = "";
  return {
    name: "rimelight:ui-docs-meta",
    configResolved(config) {
      uiRoot = path.resolve(config.root, "..", "..", "packages", "ui");
    },
    resolveId(id) {
      return id === ID ? RESOLVED : undefined;
    },
    async load(id) {
      if (id !== RESOLVED) return undefined;
      const meta = await extractAllMeta(uiRoot);
      return `export default ${JSON.stringify(meta)};`;
    },
    // Theme edits in packages/ui should refresh the docs.
    handleHotUpdate(ctx) {
      if (!ctx.file.replace(/\\/g, "/").includes("/packages/ui/src/components/")) return;
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED);
      if (mod) ctx.server.moduleGraph.invalidateModule(mod);
    },
  };
}
