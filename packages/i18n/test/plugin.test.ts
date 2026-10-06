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
  it("creates virtual modules for config and runtime with inferred locales", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-virtual-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });

    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ nav: { home: "Home" } }));
    fs.writeFileSync(path.join(i18nDir, "pt-BR.json"), JSON.stringify({ nav: { home: "Início" } }));
    fs.writeFileSync(path.join(i18nDir, "es.json"), JSON.stringify({ nav: { home: "Inicio" } }));

    try {
      const plugins: Plugin[] = i18n({
        defaultLocale: "en",
        prefixDefaultLocale: false,
        translationsDir: i18nDir,
      });

      expect(plugins.length).toBeGreaterThan(0);
      const configPlugin = plugins[0]!;

      // Resolve IDs
      expect(await callHook(configPlugin.resolveId, "virtual:rimelight-i18n-config")).toBe(
        "\0virtual:rimelight-i18n-config",
      );
      expect(await callHook(configPlugin.resolveId, "other-module")).toBeNull();

      // Load virtual content
      await callHook(configPlugin.configResolved, { root: tmpDir });
      const loaded = (await callHook(
        configPlugin.load,
        "\0virtual:rimelight-i18n-config",
      )) as string;
      expect(loaded).toContain(`["en","es","pt-BR"]`);
      expect(loaded).toContain(`export const defaultLocale = "en";`);
      expect(loaded).toContain(`export const prefixDefaultLocale = false;`);
      expect(loaded).toContain(`"Início"`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles default options when none are passed", async () => {
    const plugins: Plugin[] = i18n();
    const configPlugin = plugins[0]!;
    const loaded = (await callHook(configPlugin.load, "\0virtual:rimelight-i18n-config")) as string;

    expect(loaded).toContain(`export const defaultLocale = "en";`);
    expect(loaded).toContain(`export const prefixDefaultLocale = true;`);
    expect(loaded).toContain(`export const kvBinding = "TRANSLATIONS_KV";`);
    expect(loaded).toContain(`export const skipPaths = ["/api","/_"];`);
  });

  it("emits configured kvBinding and skipPaths to the virtual config", async () => {
    const plugins: Plugin[] = i18n({ kvBinding: "I18N_KV", skipPaths: ["/internal"] });
    const configPlugin = plugins[0]!;
    const loaded = (await callHook(configPlugin.load, "\0virtual:rimelight-i18n-config")) as string;

    expect(loaded).toContain(`export const kvBinding = "I18N_KV";`);
    expect(loaded).toContain(`export const skipPaths = ["/internal"];`);
  });

  it("generates translations seed file on closeBundle", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-plugin-seed-"));
    const i18nDir = path.join(tmpDir, "src", "i18n");
    fs.mkdirSync(i18nDir, { recursive: true });
    fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ nav: { home: "Home" } }));
    fs.writeFileSync(path.join(i18nDir, "pt.json"), JSON.stringify({ nav: { home: "Início" } }));

    process.env["WRANGLER_OUT_DIR"] = tmpDir;

    try {
      const plugins: Plugin[] = i18n({
        translationsDir: i18nDir,
      });

      const configPlugin = plugins[0]!;
      await callHook(configPlugin.configResolved, { root: tmpDir });
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
      const plugins: Plugin[] = i18n({
        translationsDir: path.join(tmpDir, "src", "i18n"),
      });

      const configPlugin = plugins[0]!;
      await callHook(configPlugin.configResolved, { root: tmpDir });

      const loaded = (await callHook(
        configPlugin.load,
        "\0virtual:rimelight-i18n-config",
      )) as string;
      expect(loaded).toContain(`["en","pt"]`);
      expect(loaded).toContain(`export const defaultLocale = "en";`);
      expect(loaded).toContain(`"Olá"`);
      expect(loaded).toContain(`"Hello"`);
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
      const pluginsWithoutEn: Plugin[] = i18n({
        translationsDir: path.join(tmpDir, "src", "i18n"),
      });
      const pluginA = pluginsWithoutEn[0]!;
      await callHook(pluginA.configResolved, { root: tmpDir });
      const loadedA = (await callHook(pluginA.load, "\0virtual:rimelight-i18n-config")) as string;
      expect(loadedA).toContain(`export const defaultLocale = "pt";`);

      // Now add "en.json"
      fs.writeFileSync(path.join(i18nDir, "en.json"), JSON.stringify({ a: { b: "0" } }));
      const pluginsWithEn: Plugin[] = i18n({
        translationsDir: path.join(tmpDir, "src", "i18n"),
      });
      const pluginB = pluginsWithEn[0]!;
      await callHook(pluginB.configResolved, { root: tmpDir });
      const loadedB = (await callHook(pluginB.load, "\0virtual:rimelight-i18n-config")) as string;
      expect(loadedB).toContain(`export const defaultLocale = "en";`);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
