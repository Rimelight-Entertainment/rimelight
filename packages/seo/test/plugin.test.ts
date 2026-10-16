import { describe, it, expect } from "vite-plus/test";
import { seo, isContained } from "../src/plugin";
import path from "node:path";

const VIRTUAL_ID = "virtual:rimelight-seo";
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const VIRTUAL_SERVER_ID = "virtual:rimelight-seo/server";
const RESOLVED_VIRTUAL_SERVER_ID = `\0${VIRTUAL_SERVER_ID}`;

async function callHook<T>(hook: unknown, ...args: any[]): Promise<T> {
  const fn =
    typeof hook === "function" ? hook : (hook as { handler?: unknown } | undefined)?.handler;
  if (typeof fn !== "function") throw new Error("hook not implemented");
  return (await (fn as (...a: any[]) => unknown).call(undefined, ...args)) as T;
}

describe("isContained path containment", () => {
  const root = process.cwd();

  it("returns true for paths inside root", () => {
    expect(isContained(root, path.join(root, "package.json"))).toBe(true);
    expect(isContained(root, "./package.json")).toBe(true);
  });

  it("returns false for path traversal attempts", () => {
    expect(isContained(root, "../../../../../../../etc/passwd")).toBe(false);
    expect(isContained(root, "../..")).toBe(false);
  });
});

describe("seo Vite Plugin", () => {
  it("resolves and loads virtual modules", async () => {
    const plugin = seo({
      name: "Test Site",
      url: "https://test.rimelight.com",
    });

    expect(await callHook(plugin.resolveId, VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID);
    expect(await callHook(plugin.resolveId, VIRTUAL_SERVER_ID)).toBe(RESOLVED_VIRTUAL_SERVER_ID);
    expect(await callHook(plugin.resolveId, "other-id")).toBeNull();

    const configCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_ID)) as string;
    expect(configCode).toContain("export const siteConfig =");
    expect(configCode).toContain('"name":"Test Site"');

    const serverCode = (await callHook(plugin.load, RESOLVED_VIRTUAL_SERVER_ID)) as string;
    expect(serverCode).toContain("export const masterIconBuffer =");
  });

  it("emits static assets during generateBundle", async () => {
    const emitted: any[] = [];
    const plugin = seo({
      name: "Test Site",
      url: "https://test.rimelight.com",
      robots: true,
      sitemap: true,
    });

    const hook =
      typeof plugin.generateBundle === "function"
        ? plugin.generateBundle
        : (plugin.generateBundle as any)?.handler;

    await hook.call({
      emitFile: (asset: any) => emitted.push(asset),
    });

    expect(emitted.some((a) => a.fileName === "robots.txt")).toBe(true);
    expect(emitted.some((a) => a.fileName === "sitemap.xml")).toBe(true);
    expect(emitted.some((a) => a.fileName === "sitemap-index.xml")).toBe(true);
  });
});
