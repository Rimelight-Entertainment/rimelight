import type { Plugin } from "vite-plus";
import type { SeoConfig } from "./types";
import { normalizeSeoConfig } from "./meta";

const ID = "virtual:rimelight-seo";
const RESOLVED_ID = `\0${ID}`;

/**
 * Consolidated Vite Plugin providing virtual:rimelight-seo configuration module.
 */
export function seo(options: SeoConfig = {}): Plugin {
  const config = normalizeSeoConfig(options);

  return {
    name: "rimelight:seo",
    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
    load: (id) =>
      id === RESOLVED_ID ? `export const config = ${JSON.stringify(config)};` : undefined,
  };
}
