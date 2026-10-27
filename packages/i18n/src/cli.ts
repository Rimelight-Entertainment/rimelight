import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { DEFAULT_DIR, DEFAULT_TYPES } from "./constants";
import type { I18nLintConfig, KeyCasing } from "./types";
import { syncTypedKeys } from "./typegen";
import { fixTranslations, formatAuditReport, verifyTranslations } from "./lint";

// ── CLI ──────────────────────────────────────────────────────────────────────

const HELP_TEXT = `
Usage:
  rimelight-i18n [action] [options]

Actions:
  check (default)  Verify translation files across locales for missing, stale, or invalid keys
  types            Generate TypeScript declaration file for translation keys

Options:
  -d, --dir <path>     Directory containing <locale>.json files (default: "${DEFAULT_DIR}")
  -b, --base <locale>  Base/default locale code to compare against (default: "en")
  -o, --out <path>     Output path for declaration file (default: "${DEFAULT_TYPES}")
  -c, --config <file>  With "types": run the rimelight:i18n plugin from this Vite config, so its settings decide the output
  -t, --types          Generate declaration file during check
  -f, --fix            Auto-prune stale keys and generate missing key skeletons
  --allow-empty        Do not treat empty strings as missing/invalid translations
  --casing <casing>    Enforce key casing: "kebab-case" (default), "camelCase", "snake_case", or "any"
  --allow-flat         Allow flat underscores in key tokens instead of enforcing nested kebab-case
  -h, --help           Show this help message
`;

type PluginHooks = {
  name?: string;
  configResolved?: (config: { root: string }) => unknown;
  buildStart?: () => unknown;
};

const findI18nPlugin = (list: unknown): PluginHooks | undefined => {
  for (const item of Array.isArray(list) ? list : [list]) {
    const found = Array.isArray(item) ? findI18nPlugin(item) : (item as PluginHooks | undefined);
    if (found?.name === "rimelight:i18n") return found;
  }
  return undefined;
};

/** Runs the plugin's build-start step from a Vite config, so the config alone decides where keys are written. */
const typesFromViteConfig = async (configFile: string): Promise<number> => {
  const { loadConfigFromFile } = await import("vite-plus");
  const file = path.resolve(process.cwd(), configFile);
  const root = path.dirname(file);
  const loaded = await loadConfigFromFile({ command: "build", mode: "production" }, file, root);
  const plugin = findI18nPlugin(loaded?.config?.plugins);
  if (!plugin) {
    console.error(`✖ [i18n] No rimelight:i18n plugin found in ${configFile}`);
    return 1;
  }
  plugin.configResolved?.({ root });
  await plugin.buildStart?.();
  console.log(`✔ [i18n] Typed keys written (settings from ${configFile})`);
  return 0;
};

export const runCli = async (argv: string[] = process.argv.slice(2)): Promise<number> => {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      dir: { type: "string", short: "d" },
      base: { type: "string", short: "b", default: "en" },
      out: { type: "string", short: "o" },
      config: { type: "string", short: "c" },
      types: { type: "boolean", short: "t", default: false },
      fix: { type: "boolean", short: "f", default: false },
      "allow-empty": { type: "boolean", default: false },
      casing: { type: "string", default: "kebab-case" },
      "allow-flat": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    return 0;
  }

  const action = positionals[0] || "check";
  if (action !== "check" && action !== "types") {
    console.error(`Unknown action: '${action}'. Run 'rimelight-i18n --help' for usage.`);
    return 1;
  }

  if (action === "types" && values.config) return typesFromViteConfig(values.config);

  const dir = values.dir || DEFAULT_DIR;
  const localesDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(localesDir) || !fs.statSync(localesDir).isDirectory()) {
    console.error(
      `✖ [i18n] Could not find translation directory. Pass --dir <path> (e.g. --dir src/i18n)`,
    );
    return 1;
  }

  const translations: Record<string, Record<string, any>> = {};
  const jsonFiles = fs.readdirSync(localesDir).filter((f) => f.endsWith(".json"));
  if (jsonFiles.length === 0) {
    console.error(`✖ [i18n] No .json translation files found in ${localesDir}`);
    return 1;
  }

  for (const file of jsonFiles) {
    try {
      translations[path.basename(file, ".json")] = JSON.parse(
        fs.readFileSync(path.join(localesDir, file), "utf-8"),
      );
    } catch (error) {
      console.error(`✖ [i18n] Failed to parse ${file}: ${(error as any)?.message || error}`);
      return 1;
    }
  }

  const baseLocale = values.base || "en";
  if (!translations[baseLocale]) {
    console.error(
      `✖ [i18n] Base locale '${baseLocale}' not found in ${localesDir} (found: ${Object.keys(translations).join(", ")})`,
    );
    return 1;
  }

  const keys = {
    root: process.cwd(),
    dir,
    baseLocale,
    out: path.resolve(process.cwd(), values.out || DEFAULT_TYPES),
  };

  if (action === "types") {
    const result = syncTypedKeys(keys);
    if (!result) return 1;
    console.log(
      result.written
        ? `✔ [i18n] Generated types for ${result.keys} keys at ${keys.out}`
        : `✔ [i18n] Types at ${keys.out} are already up to date.`,
    );
    return 0;
  }

  const lintOptions: I18nLintConfig = {
    casing: (values.casing as KeyCasing) || "kebab-case",
    disallowFlatUnderscores: !values["allow-flat"],
    disallowSelfNested: true,
  };

  let report = verifyTranslations(translations, {
    defaultLocale: baseLocale,
    allowEmpty: values["allow-empty"],
    lint: lintOptions,
  });

  if (!report.isValid && values.fix) {
    console.log(`ℹ [i18n] Fixing translation files in ${localesDir}...`);
    const fixed = fixTranslations(translations, baseLocale);
    for (const [locale, data] of Object.entries(fixed)) {
      fs.writeFileSync(
        path.join(localesDir, `${locale}.json`),
        JSON.stringify(data, null, 2) + "\n",
        "utf-8",
      );
    }
    report = verifyTranslations(fixed, {
      defaultLocale: baseLocale,
      allowEmpty: values["allow-empty"],
      lint: lintOptions,
    });
    console.log(`✔ [i18n] Successfully updated translation files.`);
  }

  // After --fix the files on disk are already updated, so the keys come from the fixed data.
  if (values.types) syncTypedKeys(keys);

  const formatted = formatAuditReport(report);
  if (report.isValid) {
    console.log(formatted);
    return 0;
  }

  console.error(formatted);
  if (!values.fix) {
    console.error(
      `\nRun with --fix to automatically prune stale keys and generate missing skeletons.`,
    );
  }
  return 1;
};
