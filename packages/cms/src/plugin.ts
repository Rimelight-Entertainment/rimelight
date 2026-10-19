import type { Plugin } from "vite-plus";
import type { CmsConfig } from "./types";

const ID = "virtual:rimelight-cms";
const RESOLVED_ID = `\0${ID}`;

export const cms = (options: CmsConfig = {}): Plugin => ({
  name: "rimelight:cms",
  resolveId(id) {
    if (id === ID) return RESOLVED_ID;
    return undefined;
  },
  async load(id) {
    if (id !== RESOLVED_ID) return undefined;
    let hasDb = false;
    try {
      const resolved = await this.resolve("#db", `${process.cwd()}/src/fetch.ts`);
      if (resolved) hasDb = true;
    } catch {}
    return [
      hasDb ? `export { db } from "#db";` : `export const db = undefined;`,
      `export const config = ${JSON.stringify(options)};`,
    ].join("\n");
  },
});
