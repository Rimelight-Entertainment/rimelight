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
    buildStart: () => loader.emitTypes(),
    hotUpdate(ctx) {
      if ((this as { environment?: { name?: string } }).environment?.name !== "client") return;
      if (!loader.isTranslationFile(ctx.file)) return;
      loader.resetTranslations();
      loader.invalidateVirtualModules(ctx.server, RESOLVED_ID);
      ctx.server.ws.send({ type: "full-reload" });
      return [];
    },
  };
}
