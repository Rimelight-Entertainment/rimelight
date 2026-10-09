import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import type { Plugin } from "vite-plus";
import { i18n } from "../src/plugin";

/**
 * Invoke a Vite object-hook the way the container does (function or { handler }).
 */
async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(undefined, ...args)) as T;
}

describe("@rimelight/i18n Vite plugin", () => {
  it("creates disk-backed artifacts in .rimelight/i18n with inferred locales and alias", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-disk-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ nav: { home: "Home" } }));
    fs.writeFileSync(path.join(i18nDir, "pt-BR.json"), JSON.stringify({ nav: { home: "Início" } }));
    fs.writeFileSync(path.join(i18nDir, "es.json"), JSON.stringify({ nav: { home: "Inicio" } }));

    try {
      const configPlugin: Plugin = i18n({
        defaultLocale: "en",
        prefixDefaultLocale: false,
        translationsDir: i18nDir,
      });

      // Config hook
      const viteConfig = (await callHook(configPlugin.config, { root: tmpDir })) as any;
      const aliases = viteConfig.resolve.alias;
      const findAlias = (name: string) =>
        aliases.find((a: any) => (a.find instanceof RegExp ? a.find.test(name) : a.find === name));
      expect(findAlias("#rimelight/i18n")?.replacement).toMatch(
        /[\\/]\.rimelight[\\/]i18n[\\/]config\.js$/,
      );

      // Check generated files
      const generatedJs = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.js");
      const generatedDts = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.d.ts");
      expect(fs.existsSync(generatedJs)).toBe(true);
      expect(fs.existsSync(generatedDts)).toBe(true);

      const contentJs = fs.readFileSync(generatedJs, "utf-8");
      expect(contentJs).toContain(`export const locales = ["en", "es", "pt-BR"];`);
      expect(contentJs).toContain(`export const defaultLocale = "en";`);
      expect(contentJs).toContain(`export const prefixDefaultLocale = false;`);
      expect(contentJs).toContain(`"Início"`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles default options when none are passed", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-default-"));
    try {
      const configPlugin: Plugin = i18n();
      await callHook(configPlugin.config, { root: tmpDir });

      const generatedJs = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.js");
      const contentJs = fs.readFileSync(generatedJs, "utf-8");

      expect(contentJs).toContain(`export const defaultLocale = "en";`);
      expect(contentJs).toContain(`export const prefixDefaultLocale = true;`);
      expect(contentJs).toContain(`export const kvBinding = "TRANSLATIONS_KV";`);
      expect(contentJs).toContain(`export const skipPaths = ["/api", "/_"];`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("emits configured kvBinding and skipPaths to the generated config", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-custom-"));
    try {
      const configPlugin: Plugin = i18n({ kvBinding: "I18N_KV", skipPaths: ["/internal"] });
      await callHook(configPlugin.config, { root: tmpDir });

      const generatedJs = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.js");
      const contentJs = fs.readFileSync(generatedJs, "utf-8");

      expect(contentJs).toContain(`export const kvBinding = "I18N_KV";`);
      expect(contentJs).toContain(`export const skipPaths = ["/internal"];`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates translations seed file on closeBundle", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-seed-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });
    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ nav: { home: "Home" } }));
    fs.writeFileSync(path.join(i18nDir, "pt.json"), JSON.stringify({ nav: { home: "Início" } }));

    process.env["WRANGLER_OUT_DIR"] = tmpDir;

    try {
      const configPlugin: Plugin = i18n({
        translationsDir: i18nDir,
      });
      await callHook(configPlugin.config, { root: tmpDir });
      await callHook(configPlugin.closeBundle);

      const seedPath = path.join(tmpDir, "_translations-seed.json");
      expect(fs.existsSync(seedPath)).toBe(true);

      const seedContent = JSON.parse(fs.readFileSync(seedPath, "utf-8"));
      expect(seedContent.keys).toContainEqual({
        key: "locale:en",
        value: JSON.stringify({ nav: { home: "Home" } }),
      });
      expect(seedContent.keys).toContainEqual({
        key: "locale:en:nav",
        value: JSON.stringify({ home: "Home" }),
      });
      expect(seedContent.keys).toContainEqual({
        key: "locale:pt:nav",
        value: JSON.stringify({ home: "Início" }),
      });
    } finally {
      delete process.env["WRANGLER_OUT_DIR"];
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("automatically infers locales and loads translations from directory", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-dir-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ header: { title: "Hello" } }));
    fs.writeFileSync(path.join(i18nDir, "pt.json"), JSON.stringify({ header: { title: "Olá" } }));

    try {
      const configPlugin: Plugin = i18n({
        translationsDir: path.join(tmpDir, "src", "i18n"),
      });
      await callHook(configPlugin.config, { root: tmpDir });

      const generatedJs = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.js");
      const contentJs = fs.readFileSync(generatedJs, "utf-8");

      expect(contentJs).toContain(`export const locales = ["en", "pt"];`);
      expect(contentJs).toContain(`export const defaultLocale = "en";`);
      expect(contentJs).toContain(`"Olá"`);
      expect(contentJs).toContain(`"Hello"`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("defaults to 'en' when 'en' is present, and to the first locale when 'en' is absent", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-default-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    // When "pt" and "ro" are present (no "en")
    fs.writeFileSync(path.join(i18nDir, "pt.json"), JSON.stringify({ a: { b: "1" } }));
    fs.writeFileSync(path.join(i18nDir, "ro.json"), JSON.stringify({ a: { b: "2" } }));

    try {
      const pluginA: Plugin = i18n({
        translationsDir: path.join(tmpDir, "src", "i18n"),
      });
      await callHook(pluginA.config, { root: tmpDir });
      const generatedJsA = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.js");
      const contentA = fs.readFileSync(generatedJsA, "utf-8");
      expect(contentA).toContain(`export const defaultLocale = "pt";`);

      // Now add "en.json"
      fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ a: { b: "0" } }));
      const pluginB: Plugin = i18n({
        translationsDir: path.join(tmpDir, "src", "i18n"),
      });
      await callHook(pluginB.config, { root: tmpDir });
      const generatedJsB = path.join(tmpDir, "node_modules", ".rimelight", "i18n", "config.js");
      const contentB = fs.readFileSync(generatedJsB, "utf-8");
      expect(contentB).toContain(`export const defaultLocale = "en";`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
