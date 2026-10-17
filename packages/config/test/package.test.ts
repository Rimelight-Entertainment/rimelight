import { describe, it, expect } from "vite-plus/test";
import path from "node:path";
import fs from "node:fs";

describe("@rimelight/config package", () => {
  describe("package integrity utils", () => {
    it("should export valid tsconfig files", () => {
      const pkgDir = path.resolve(import.meta.dirname, "..");
      const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"));

      expect(pkg.exports).toBeDefined();
      expect(pkg.exports["./tsconfig/base"]).toBeDefined();
      expect(pkg.exports["./tsconfig/solid"]).toBeDefined();
      expect(fs.existsSync(path.join(pkgDir, pkg.exports["./tsconfig/base"]))).toBe(true);
      expect(fs.existsSync(path.join(pkgDir, pkg.exports["./tsconfig/solid"]))).toBe(true);
    });
  });
});
