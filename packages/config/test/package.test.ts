import { describe, it, expect } from "vite-plus/test";
import path from "node:path";
import fs from "node:fs";

describe("@rimelight/config package", () => {
  describe("package integrity utils", () => {
    it("should not ship exports or files entries that do not exist on disk", () => {
      const pkgDir = path.resolve(import.meta.dirname, "..");
      const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, "package.json"), "utf-8"));

      const targets: string[] = [];
      for (const value of Object.values<unknown>(pkg.exports ?? {})) {
        if (typeof value === "string") {
          targets.push(value);
        } else if (value && typeof value === "object") {
          for (const entry of Object.values<unknown>(value as Record<string, unknown>)) {
            if (typeof entry === "string") targets.push(entry);
          }
        }
      }
      const files: string[] = pkg.files ?? [];
      targets.push(...files);

      expect(targets.length).toBeGreaterThan(0);

      const missing = targets
        .filter((t) => t.startsWith("./"))
        .map((t) => t.replace(/^\.\//, ""))
        .filter((rel) => !fs.existsSync(path.join(pkgDir, rel)));
      expect(missing).toEqual([]);
    });
  });
});
