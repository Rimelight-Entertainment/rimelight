import type { Plugin } from "vite-plus";
import type { CmsConfig } from "./types";
import path from "node:path";
import fs from "node:fs";

const ID = "virtual:rimelight-cms";
const RESOLVED_ID = `\0${ID}`;
const DB_ID = "virtual:rimelight-cms/db";
const RESOLVED_DB_ID = `\0${DB_ID}`;

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
    resolveId: (id) => (id === ID ? RESOLVED_ID : id === DB_ID ? RESOLVED_DB_ID : undefined),
    load: async (id) =>
      id === RESOLVED_ID
        ? `export const config = ${JSON.stringify({ routePrefix, storage: storageConfig })};`
        : id === RESOLVED_DB_ID
          ? resolveDbCode()
          : undefined,
  };
}
