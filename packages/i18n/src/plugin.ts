import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";

export interface RimelightI18nPluginOptions {
  defaultLocale?: string;
  translationsDir?: string;
  prefixDefaultLocale?: boolean;
}

export const i18n = (options?: RimelightI18nPluginOptions): Plugin => {
  let cached: Record<string, any> = {};

  const flatten = (obj: any, prefix = "", res: Record<string, any> = {}): Record<string, any> => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (k === "__proto__" || k === "constructor" || k === "prototype") continue;
      const key = prefix ? `${prefix}.${k}` : k;
      res[key] = v;
      if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, res);
    }
    return res;
  };

  const getDir = (root: string) => path.resolve(root, options?.translationsDir ?? "src/i18n");

  return defineRimelightArtifactPlugin({
    pkgName: "i18n",
    watch: ({ root }) => [getDir(root)],
    config: ({ root }) => {
      const dir = getDir(root);
      const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
        : [];
      const indexed: Record<string, any> = {};

      cached = {};
      for (const file of files) {
        const locale = path.basename(file, ".json");
        const json = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
        cached[locale] = json;
        indexed[locale] = flatten(json);
      }

      const locales = Object.keys(cached).sort();
      return {
        locales,
        defaultLocale:
          options?.defaultLocale ?? (locales.includes("en") ? "en" : (locales[0] ?? "en")),
        prefixDefaultLocale: options?.prefixDefaultLocale ?? true,
        translations: indexed,
        skipPaths: ["/api", "/_"],
      };
    },
    closeBundle: () => {
      if (!Object.keys(cached).length) return;
      const outDir = path.join(process.env["WRANGLER_OUT_DIR"] ?? "dist", "locales");
      fs.mkdirSync(outDir, { recursive: true });
      for (const [locale, data] of Object.entries(cached)) {
        fs.writeFileSync(path.join(outDir, `${locale}.json`), JSON.stringify(data, null, 2));
      }
    },
  });
};
