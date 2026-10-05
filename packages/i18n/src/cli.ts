#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { findTranslationsDir, readLocaleFiles } from "./fs";
import { verifyTranslations, formatAuditReport, fixTranslations } from "./utils";

const HELP_TEXT = `
Usage:
  rimelight-i18n [action] [options]

Actions:
  check (default)  Verify translation files across locales for missing, stale, or invalid keys

Options:
  -d, --dir <path>     Directory containing <locale>.json files (auto-discovered if omitted)
  -b, --base <locale>  Base/default locale code to compare against (default: "en")
  -f, --fix            Auto-prune stale keys and generate missing key skeletons
  --allow-empty        Do not treat empty strings as missing/invalid translations
  -h, --help           Show this help message
`;

export async function runCli(argv: string[] = process.argv.slice(2)): Promise<number> {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      dir: { type: "string", short: "d" },
      base: { type: "string", short: "b", default: "en" },
      fix: { type: "boolean", short: "f", default: false },
      "allow-empty": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    return 0;
  }

  const action = positionals[0] || "check";
  if (action !== "check") {
    console.error(`Unknown action: '${action}'. Run 'rimelight-i18n --help' for usage.`);
    return 1;
  }

  const localesDir = findTranslationsDir(process.cwd(), values.dir);
  if (!localesDir) {
    console.error(
      `✖ [i18n] Could not find translation directory. Pass --dir <path> (e.g. --dir src/i18n)`,
    );
    return 1;
  }

  const { files, translations, errors } = readLocaleFiles(localesDir);
  if (files.length === 0) {
    console.error(`✖ [i18n] No .json translation files found in ${localesDir}`);
    return 1;
  }
  if (errors.length > 0) {
    const { file, error } = errors[0]!;
    console.error(`✖ [i18n] Failed to parse ${file}: ${(error as any)?.message || error}`);
    return 1;
  }

  const baseLocale = values.base || "en";
  if (!translations[baseLocale]) {
    console.error(
      `✖ [i18n] Base locale '${baseLocale}' not found in ${localesDir} (found: ${Object.keys(translations).join(", ")})`,
    );
    return 1;
  }

  let report = verifyTranslations(translations, {
    defaultLocale: baseLocale,
    allowEmpty: values["allow-empty"],
  });

  if (!report.isValid && values.fix) {
    console.log(`ℹ [i18n] Fixing translation files in ${localesDir}...`);
    const fixed = fixTranslations(translations, baseLocale);
    for (const [locale, data] of Object.entries(fixed)) {
      const filePath = path.join(localesDir, `${locale}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
    }
    report = verifyTranslations(fixed, {
      defaultLocale: baseLocale,
      allowEmpty: values["allow-empty"],
    });
    console.log(`✔ [i18n] Successfully updated translation files.`);
  }

  const formatted = formatAuditReport(report);
  if (report.isValid) {
    console.log(formatted);
    return 0;
  } else {
    console.error(formatted);
    if (!values.fix) {
      console.error(
        `\nRun with --fix to automatically prune stale keys and generate missing skeletons.`,
      );
    }
    return 1;
  }
}

// Execute directly if run via CLI
if (
  process.argv[1] &&
  (import.meta.url === pathToFileURL(process.argv[1]).href ||
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, "/")))
) {
  void runCli().then((code) => {
    if (code !== 0) {
      process.exit(code);
    }
  });
}
