import type { Plugin } from "vite-plus";
import type { I18nConfig } from "./types";
import { createI18nLoader } from "./loader";

const ID = "virtual:rimelight-i18n";
const RESOLVED_ID = `\0${ID}`;

export function i18n(options: I18nConfig = {}): Plugin {
  const loader = createI18nLoader(options);

  return {
    name: "rimelight:i18n",
    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
    load: async (id) =>
      id === RESOLVED_ID
        ? `export const config = ${JSON.stringify(loader.buildConfigPayload())};`
        : undefined,
    hotUpdate(ctx) {
      return loader.handleHotUpdate(this, ctx, RESOLVED_ID);
    },
  };
}
