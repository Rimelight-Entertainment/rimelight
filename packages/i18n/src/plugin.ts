import type { Plugin } from "vite-plus";
import type { I18nConfig } from "./types";

const ID = "virtual:rimelight-i18n";
const RESOLVED_ID = `\0${ID}`;

export const i18n = (options: I18nConfig = {}): Plugin => ({
  name: "rimelight:i18n",
  resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
  load: async (id) =>
    id === RESOLVED_ID ? `export const config = ${JSON.stringify(options)};` : undefined,
});
