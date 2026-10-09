import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import {
  findNodeModulesRoot,
  emitRimelightArtifact,
  serializeData,
  resolveImportSpecifier,
  generateESModule,
  defineRimelightArtifactPlugin,
} from "../src/generator";

describe("@rimelight/config generator utils", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rimelight-config-test-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  describe("findNodeModulesRoot", () => {
    it("locates local node_modules if it exists", () => {
      const localNm = path.join(tempDir, "node_modules");
      fs.mkdirSync(localNm);
      expect(findNodeModulesRoot(tempDir)).toBe(localNm);
    });

    it("traverses upward to locate monorepo root node_modules", () => {
      const rootNm = path.join(tempDir, "node_modules");
      fs.mkdirSync(rootNm);
      const appDir = path.join(tempDir, "apps", "web");
      fs.mkdirSync(appDir, { recursive: true });

      expect(findNodeModulesRoot(appDir)).toBe(rootNm);
    });

    it("creates local node_modules fallback if none exists", () => {
      const emptyDir = path.join(tempDir, "isolated");
      fs.mkdirSync(emptyDir);
      const res = findNodeModulesRoot(emptyDir);
      expect(res).toBe(path.join(emptyDir, "node_modules"));
      expect(fs.existsSync(res)).toBe(true);
    });
  });

  describe("serializeData", () => {
    it("serializes primitives, dates, and regexes", () => {
      expect(serializeData("hello")).toBe('"hello"');
      expect(serializeData(123)).toBe("123");
      expect(serializeData(true)).toBe("true");
      expect(serializeData(100n)).toBe("100n");
      expect(serializeData(/abc/gi)).toBe('new RegExp("abc", "gi")');
      const date = new Date("2026-01-01T00:00:00.000Z");
      expect(serializeData(date)).toBe(`new Date("2026-01-01T00:00:00.000Z")`);
    });

    it("serializes arrays, sets, maps, and objects", () => {
      expect(serializeData([1, 2, "a"])).toBe('[1, 2, "a"]');
      expect(serializeData(new Set([1, 2]))).toBe("new Set([1, 2])");
      expect(serializeData(new Map([["a", 1]]))).toBe('new Map([["a", 1]])');
      expect(serializeData({ a: 1, b: "test" })).toContain('"a": 1');
    });

    it("throws on functions and symbols", () => {
      expect(() => serializeData(() => {})).toThrow("Functions cannot be serialized directly");
      expect(() => serializeData(Symbol("test"))).toThrow(
        "Symbols cannot be serialized into disk artifacts",
      );
    });
  });

  describe("emitRimelightArtifact", () => {
    it("emits disk artifacts and detects changed status", () => {
      const res1 = emitRimelightArtifact(tempDir, "testpkg", {
        "config.js": "export const test = 1;",
      });
      expect(res1.changed).toBe(true);
      expect(fs.existsSync(path.join(res1.targetDir, "config.js"))).toBe(true);

      // Second write with identical content should not change
      const res2 = emitRimelightArtifact(tempDir, "testpkg", {
        "config.js": "export const test = 1;",
      });
      expect(res2.changed).toBe(false);

      // Write with modified content
      const res3 = emitRimelightArtifact(tempDir, "testpkg", {
        "config.js": "export const test = 2;",
      });
      expect(res3.changed).toBe(true);
    });
  });

  describe("generateESModule", () => {
    it("resolves relative import specifiers", () => {
      const rel = resolveImportSpecifier(
        "./src/custom.ts",
        tempDir,
        path.join(tempDir, "node_modules", ".rimelight", "pkg"),
      );
      expect(rel).toContain("custom.ts");
      expect(rel.startsWith("./") || rel.startsWith("../")).toBe(true);
    });

    it("resolves absolute import specifiers with POSIX slashes", () => {
      const absPath = path.resolve(tempDir, "src", "db.ts");
      const rel = resolveImportSpecifier(
        absPath,
        tempDir,
        path.join(tempDir, "node_modules", ".rimelight", "seo"),
      );
      expect(rel).toContain("src/db.ts");
      expect(rel.includes("\\")).toBe(false);
      expect(rel.startsWith("./") || rel.startsWith("../")).toBe(true);
    });

    it("generates module with static values and re-based imports", () => {
      const code = generateESModule(
        [
          { name: "version", value: "1.0.0" },
          {
            name: "customAdapter",
            importSpecifier: { from: "./src/adapter.ts", symbol: "adapter" },
          },
        ],
        { rootDir: tempDir, targetDir: path.join(tempDir, "node_modules", ".rimelight", "test") },
      );

      expect(code).toContain('export const version = "1.0.0";');
      expect(code).toContain("import { adapter as _ref_1 }");
      expect(code).toContain("export const customAdapter = _ref_1;");
    });
  });

  describe("defineRimelightArtifactPlugin", () => {
    it("creates a vite plugin that defines aliases and emits artifacts", () => {
      const plugin = defineRimelightArtifactPlugin({
        pkgName: "testplugin",
        config: { enabled: true, count: 5 },
      });

      expect(plugin.name).toBe("rimelight:testplugin");
      expect(plugin.enforce).toBe("pre");

      const configRes = (plugin.config as any)({ root: tempDir });
      expect(configRes.resolve?.alias).toBeDefined();
      expect(configRes.resolve.alias.some((a: any) => a.find.test("#rimelight/testplugin"))).toBe(
        true,
      );
      expect(
        configRes.resolve.alias.some((a: any) => a.find.test("#rimelight/testplugin/sub")),
      ).toBe(true);

      const generatedConfigFile = path.join(
        tempDir,
        "node_modules",
        ".rimelight",
        "testplugin",
        "config.js",
      );
      expect(fs.existsSync(generatedConfigFile)).toBe(true);
    });
  });
});
