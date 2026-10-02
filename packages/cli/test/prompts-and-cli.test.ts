import { describe, expect, it } from "vite-plus/test";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import {
  pc,
  isCancel,
  intro,
  outro,
  cancel,
  spinner,
  text,
  confirm,
  select,
  multiselect,
} from "../src/prompts";
import {
  injectIntoArray,
  injectIntoLines,
  reorderKeys,
  getNested,
  setNested,
  runCreate,
} from "../src/index";

describe("@rimelight/cli - Zero-Dependency Terminal Prompter & Engine", () => {
  describe("Terminal Styling and ANSI Helpers", () => {
    it("formats text colors and styles properly without throwing", () => {
      const boldText = pc.bold("Hello");
      const magentaText = pc.magenta("Rimelight");
      const greenText = pc.green("Success");
      const cyanText = pc.cyan("Info");
      const yellowText = pc.yellow("Warning");
      const redText = pc.red("Error");
      const dimText = pc.dim("Muted");

      expect(typeof boldText).toBe("string");
      expect(typeof magentaText).toBe("string");
      expect(typeof greenText).toBe("string");
      expect(typeof cyanText).toBe("string");
      expect(typeof yellowText).toBe("string");
      expect(typeof redText).toBe("string");
      expect(typeof dimText).toBe("string");

      expect(boldText).toContain("Hello");
      expect(magentaText).toContain("Rimelight");
    });

    it("handles intro, outro, cancel, and isCancel symbols", () => {
      intro("◇ Intro Title");
      outro("◇ Outro Message");
      cancel("✖ Cancelled");

      expect(isCancel(Symbol("random"))).toBe(false);
      expect(isCancel(null)).toBe(false);
      expect(isCancel(undefined)).toBe(false);
    });

    it("runs terminal spinner lifecycle safely", () => {
      const s = spinner();
      s.start("Processing task...");
      s.message("Still processing...");
      s.stop("Done!");
    });
  });

  describe("Non-TTY Fallback Prompts", () => {
    it("returns default values in non-interactive environment", async () => {
      const textVal = await text({ message: "Project name", defaultValue: "./my-app" });
      expect(textVal).toBe("./my-app");

      const confirmVal = await confirm({ message: "Initialize git?", initialValue: true });
      expect(confirmVal).toBe(true);

      const selectVal = await select({
        message: "Select package manager",
        options: [
          { value: "pnpm", label: "pnpm" },
          { value: "npm", label: "npm" },
        ],
        initialValue: "pnpm",
      });
      expect(selectVal).toBe("pnpm");

      const multiVal = await multiselect({
        message: "Select items",
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
        ],
        initialValues: ["opt1"],
      });
      expect(multiVal).toEqual(["opt1"]);
    });
  });

  describe("Object Manipulation & Semantic Diff Utilities", () => {
    it("gets and sets nested object keys safely", () => {
      const obj: Record<string, any> = { a: { b: { c: 42 } } };
      expect(getNested(obj, "a.b.c")).toBe(42);
      expect(getNested(obj, "a.b.nonexistent")).toBeUndefined();

      setNested(obj, "a.b.d", 100);
      expect(getNested(obj, "a.b.d")).toBe(100);

      setNested(obj, "x.y.z", "created");
      expect(getNested(obj, "x.y.z")).toBe("created");
    });

    it("injects into arrays respecting starter ordering", () => {
      const starterArr = ["apple", "banana", "cherry", "date"];
      const targetArr = ["apple", "date"];

      injectIntoArray(targetArr, starterArr, "banana");
      expect(targetArr).toEqual(["apple", "banana", "date"]);

      injectIntoArray(targetArr, starterArr, "cherry");
      expect(targetArr).toEqual(["apple", "banana", "cherry", "date"]);
    });

    it("injects into lines respecting starter ordering", () => {
      const starterLines = ["import a", "import b", "import c", "export default config"];
      const targetLines = ["import a", "export default config"];

      injectIntoLines(targetLines, starterLines, "import b");
      expect(targetLines).toEqual(["import a", "import b", "export default config"]);
    });

    it("reorders keys matching starter template order while preserving custom keys", () => {
      const starter = { name: "", version: "", scripts: {}, dependencies: {} };
      const target = {
        customField: true,
        dependencies: { a: "1" },
        name: "my-app",
        scripts: { test: "vp test" },
        version: "1.0.0",
      };

      const reordered = reorderKeys(target, starter) as Record<string, any>;
      expect(Object.keys(reordered)).toEqual([
        "name",
        "version",
        "scripts",
        "dependencies",
        "customField",
      ]);
      expect(reordered["customField"]).toBe(true);
    });
  });

  describe("End-to-End Scaffolding in Headless Mode", () => {
    it("scaffolds a project cleanly and configures domain", async () => {
      const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "rimelight-cli-test-"));
      const projectDir = path.join(tempDir, "test-app");

      try {
        await runCreate({
          projectName: projectDir,
          domain: "test.example.com",
          git: false,
          install: false,
          packageManager: "pnpm",
        });

        // Verify package.json was written
        const pkgContent = await fs.readFile(path.join(projectDir, "package.json"), "utf-8");
        const pkg = JSON.parse(pkgContent);
        expect(pkg.name).toBe("test-app");
        expect(pkg.private).toBe(true);

        // Verify cloudflare.config.ts was updated
        const cloudflareContent = await fs.readFile(
          path.join(projectDir, "cloudflare.config.ts"),
          "utf-8",
        );
        expect(cloudflareContent).toContain('name: "test-dot-example-dot-com"');
        expect(cloudflareContent).toContain('pattern: "test.example.com/*"');
        expect(cloudflareContent).toContain('pattern: "www.test.example.com/*"');
        expect(cloudflareContent).not.toContain("starter.rimelight.com");

        // The starter must not ship legacy astro/wrangler config any more
        expect(existsSync(path.join(projectDir, "astro.config.ts"))).toBe(false);
        expect(existsSync(path.join(projectDir, "wrangler.jsonc"))).toBe(false);
      } finally {
        await fs.rm(tempDir, { recursive: true, force: true });
      }
    });
  });
});
