import type { Plugin } from "vite-plus";
import type { AuthConfig } from "./types";

const ID = "virtual:rimelight-auth";
const RESOLVED_ID = `\0${ID}`;

export const auth = (options: AuthConfig = {}): Plugin => ({
  name: "rimelight:auth",
  resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
  load: (id) =>
    id === RESOLVED_ID ? `export const config = ${JSON.stringify(options)};` : undefined,
});
