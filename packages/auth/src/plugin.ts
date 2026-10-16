import type { Plugin } from "vite-plus";
import type { AuthConfig } from "./types";

const VIRTUAL_ID = "virtual:rimelight-auth";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export function auth(options: AuthConfig = {}): Plugin {
  return {
    name: "rimelight:auth",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export const config = ${JSON.stringify(options)};`;
      }
      return null;
    },
  };
}
