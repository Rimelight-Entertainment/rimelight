import { describe, it, expect } from "vite-plus/test";
import { seo, isContained } from "../src/plugin";
import path from "node:path";

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
  it("injects resolve.alias for #rimelight/seo and subpaths", async () => {
    const plugin = seo({
      name: "Test Site",
      url: "https://test.rimelight.com",
    });

    const configResult = await callHook<any>(plugin.config, { root: process.cwd() });
    expect(configResult?.resolve?.alias).toBeDefined();
    const aliases = configResult.resolve.alias;
    const findAlias = (name: string) =>
      aliases.find((a: any) => (a.find instanceof RegExp ? a.find.test(name) : a.find === name));

    expect(findAlias("#rimelight/seo")).toBeDefined();
    expect(findAlias("#rimelight/seo/server")).toBeDefined();
    expect(findAlias("#rimelight/seo/client")).toBeDefined();
  });

  it("emits static assets during generateBundle", async () => {
    const emitted: any[] = [];
    const plugin = seo({
      name: "Bundle Site",
      url: "https://bundle.com",
      robots: true,
      sitemap: true,
      security: true,
    });

    const mockContext = {
      emitFile(file: any) {
        emitted.push(file);
      },
    };

    await (plugin.generateBundle as any).call(mockContext);

    const fileNames = emitted.map((e) => e.fileName);
    expect(fileNames).toContain("robots.txt");
    expect(fileNames).toContain("sitemap.xml");
    expect(fileNames).toContain("sitemap-index.xml");
    expect(fileNames).toContain(".well-known/security.txt");
    expect(fileNames).toContain("site.webmanifest");
  });

  it("emits icon assets when branding favicon SVG is provided", async () => {
    const emitted: any[] = [];
    const plugin = seo({
      name: "Icon Site",
      url: "https://icon.com",
      branding: {
        favicon: {
          svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#00f"/></svg>`,
        },
      },
    });

    await callHook(plugin.configResolved, { root: process.cwd() });

    const mockContext = {
      emitFile(file: any) {
        emitted.push(file);
      },
    };

    await (plugin.generateBundle as any).call(mockContext);

    const fileNames = emitted.map((e) => e.fileName);
    expect(fileNames).toContain("icon-192.png");
    expect(fileNames).toContain("icon-512.png");
    expect(fileNames).toContain("icon-maskable-512.png");
    expect(fileNames).toContain("favicon.ico");
    expect(fileNames).toContain("apple-touch-icon.png");
    expect(fileNames).toContain("favicon.svg");
  });
});
