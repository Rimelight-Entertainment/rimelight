import type { Plugin } from "vite-plus";
import type { CmsConfig } from "./types";
import path from "node:path";
import fs from "node:fs";

const VIRTUAL_ID = "virtual:rimelight-cms";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const VIRTUAL_DB_ID = "virtual:rimelight-cms/db";
const RESOLVED_VIRTUAL_DB_ID = `\0${VIRTUAL_DB_ID}`;

export function cms(options: CmsConfig = {}): Plugin {
  const storageConfig = {
    provider: options.storage?.provider ?? "r2",
    binding: options.storage?.binding ?? "BLOB",
    publicUrl: options.storage?.publicUrl,
    prefix: options.storage?.prefix ?? "media/",
  };
  const routePrefix = options.routePrefix ?? "/[locale]/cms";

  const resolveDbCode = (): string => {
    const candidates = options.db
      ? [path.resolve(options.db)]
      : [path.resolve("src/db/index.ts"), path.resolve("src/db/index.js"), path.resolve("src/db")];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return `export * from ${JSON.stringify(candidate)};`;
    }
    return `export const db = null;`;
  };

  return {
    name: "rimelight:cms",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      if (id === VIRTUAL_DB_ID) return RESOLVED_VIRTUAL_DB_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export const config = ${JSON.stringify({ routePrefix, storage: storageConfig })};`;
      }
      if (id === RESOLVED_VIRTUAL_DB_ID) {
        return resolveDbCode();
      }
      return null;
    },
  };
}
