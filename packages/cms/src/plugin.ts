import path from "node:path";
import fs from "node:fs";
import type { Plugin } from "vite-plus";
import type { CmsConfig } from "./types";

const VIRTUAL_ID = "virtual:rimelight-cms";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const VIRTUAL_DB_ID = "virtual:rimelight-cms/db";
const RESOLVED_VIRTUAL_DB_ID = `\0${VIRTUAL_DB_ID}`;

export function cms(options: CmsConfig = {}): Plugin {
  let rootDir = process.cwd();

  const storageConfig = {
    provider: options.storage?.provider ?? "r2",
    binding: options.storage?.binding ?? "BLOB",
    publicUrl: options.storage?.publicUrl,
    prefix: options.storage?.prefix ?? "media/",
  };
  const routePrefix = options.routePrefix ?? "/[locale]/cms";

  const resolveDbCode = (root: string): string => {
    const candidates = options.db
      ? [path.isAbsolute(options.db) ? options.db : path.resolve(root, options.db)]
      : [
          path.resolve(root, "src/db/index.ts"),
          path.resolve(root, "src/db/index.js"),
          path.resolve(root, "src/db"),
        ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return `export * from ${JSON.stringify(candidate)};`;
    }
    return `export const db = null;\nexport default null;`;
  };

  return {
    name: "rimelight:cms",
    configResolved(config) {
      rootDir = config.root ? path.resolve(config.root) : rootDir;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === VIRTUAL_DB_ID) return RESOLVED_VIRTUAL_DB_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return [
          `export const config = ${JSON.stringify({ routePrefix, storage: storageConfig })};`,
          `export const routePrefix = ${JSON.stringify(routePrefix)};`,
          `export const storageConfig = ${JSON.stringify(storageConfig)};`,
          `export const cmsOptions = config;`,
          `export default config;`,
        ].join("\n");
      }
      if (id === RESOLVED_VIRTUAL_DB_ID) {
        return resolveDbCode(rootDir);
      }
      return null;
    },
  };
}
