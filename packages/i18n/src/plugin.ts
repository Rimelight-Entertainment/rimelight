import fs from "node:fs";
import path from "node:path";
import type { Plugin, ViteDevServer } from "vite-plus";
import { DEFAULT_DIR, DEFAULT_TYPES } from "./constants";
import type { I18nConfig } from "./types";
import { syncTypedKeys } from "./typegen";

const ID = "virtual:rimelight-i18n";
const RESOLVED_ID = `\0${ID}`;

interface I18nPluginOptions extends I18nConfig {
  /** Directory holding the `<locale>.json` files, relative to the project root. Default: `src/i18n`. */
  dir?: string;
  /** Typed `t()` keys output. `false` disables it. Default: `node_modules/.rimelight/types/i18n.d.ts`. */
  types?: string | false;
}

export const i18n = ({
  dir = DEFAULT_DIR,
  translations,
  types,
  ...config
}: I18nPluginOptions = {}): Plugin => {
  const baseLocale = config.defaultLocale ?? "en";
  let root = process.cwd();
  let server: ViteDevServer | undefined;

  const localesDir = () => path.resolve(root, dir);

  // One static import per locale file, so the emitted object is already keyed by locale code.
  // Rebuilt on every load, so a locale file added in dev shows up once the module is invalidated.
  const loadConfig = (): string => {
    const settings = `...${JSON.stringify(config)}`;
    if (translations) {
      return `export const config = { ${settings}, translations: ${JSON.stringify(translations)} };`;
    }
    const files = fs.existsSync(localesDir())
      ? fs
          .readdirSync(localesDir())
          .filter((f) => f.endsWith(".json"))
          .sort()
      : [];
    const imports = files.map(
      (file, i) => `import locale${i} from ${JSON.stringify(`/${dir}/${file}`)};`,
    );
    const entries = files.map(
      (file, i) => `${JSON.stringify(path.basename(file, ".json"))}: locale${i}`,
    );
    return [
      ...imports,
      `export const config = { ${settings}, translations: { ${entries.join(", ")} } };`,
    ].join("\n");
  };

  const sync = () => {
    if (types === false) return;
    syncTypedKeys({ root, dir, baseLocale, translations, out: types ?? DEFAULT_TYPES });
  };

  const invalidate = () => {
    const mod = server?.moduleGraph.getModuleById(RESOLVED_ID);
    if (server && mod) server.moduleGraph.invalidateModule(mod);
  };

  return {
    name: "rimelight:i18n",
    configResolved: (resolved) => {
      root = resolved.root;
    },
    configureServer: (devServer) => {
      server = devServer;
    },
    buildStart: sync,
    watchChange: (id) => {
      if (!id.endsWith(".json") || path.dirname(id) !== localesDir()) return;
      invalidate();
      sync();
    },
    resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
    load: (id) => (id === RESOLVED_ID ? loadConfig() : undefined),
  };
};
