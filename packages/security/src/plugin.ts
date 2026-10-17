import type { Plugin } from "vite-plus";
import type { SecurityConfig } from "./types";

const ID = "virtual:rimelight-security";
const RESOLVED_ID = `\0${ID}`;

export const security = (options: SecurityConfig = {}): Plugin => ({
  name: "rimelight:security",
  resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
  load: (id) =>
    id === RESOLVED_ID ? `export const config = ${JSON.stringify(options)};` : undefined,
});
