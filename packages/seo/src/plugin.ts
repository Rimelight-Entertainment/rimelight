import type { Plugin } from "vite-plus";
import type { SeoConfig } from "./types";

const ID = "virtual:rimelight-seo";
const RESOLVED_ID = `\0${ID}`;

export const seo = (options: SeoConfig = {}): Plugin => ({
  name: "rimelight:seo",
  resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
  load: (id) =>
    id === RESOLVED_ID ? `export const config = ${JSON.stringify(options)};` : undefined,
});
