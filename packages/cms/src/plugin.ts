import type { Plugin } from "vite-plus";
import type { CmsConfig } from "./types";

const ID = "virtual:rimelight-cms";
const RESOLVED_ID = `\0${ID}`;

export function cms(options: CmsConfig = {}): Plugin {
  return {
    name: "rimelight:cms",
    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
    load: async (id) =>
      id === RESOLVED_ID ? `export const config = ${JSON.stringify(options)};` : undefined,
  };
}
