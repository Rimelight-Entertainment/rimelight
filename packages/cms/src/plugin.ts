import { existsSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite-plus";
import type { CmsPluginOptions } from "./types";

const ID = "virtual:rimelight-cms";
const RESOLVED_ID = `\0${ID}`;

/**
 * Vite plugin: exposes `cms.config.ts` and the plugin options as `virtual:rimelight-cms`.
 */
export const cms = (options: CmsPluginOptions = {}): Plugin => {
  let configPath: string | null = null;

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
      const opts = JSON.stringify({
        ...options,
        apiPath: options.apiPath ?? "/api/cms",
      });
      return configPath
        ? `import config from ${JSON.stringify(configPath)};\nexport { config };\nexport const options = ${opts};`
        : `export const config = {};\nexport const options = ${opts};`;
    },
  };
};

export type { CmsPluginOptions };
