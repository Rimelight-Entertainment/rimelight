import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCli } from "../src/cli";

describe("rimelight-i18n CLI", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("shows help text and exits code 0 when passed --help or -h", async () => {
    const exitCodeHelp = await runCli(["--help"]);
    expect(exitCodeHelp).toBe(0);

    const exitCodeShort = await runCli(["-h"]);
    expect(exitCodeShort).toBe(0);
  });

  it("returns error code 1 when translation directory is not found", async () => {
    const exitCode = await runCli(["--dir", "non_existent_dir_12345"]);
    expect(exitCode).toBe(1);
  });

  it("returns error code 1 when an unknown action is provided", async () => {
    const exitCode = await runCli(["unknown_command"]);
    expect(exitCode).toBe(1);
  });

  it("returns error code 1 when directory has no JSON files", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-empty-"));
    try {
      const exitCode = await runCli(["--dir", tmpDir]);
      expect(exitCode).toBe(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns error code 1 when JSON syntax is invalid", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-syntax-"));
    try {
      fs.writeFileSync(path.join(tmpDir, "en.json"), "{ invalid json }");
      const exitCode = await runCli(["--dir", tmpDir]);
      expect(exitCode).toBe(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("returns error code 1 when base locale file is missing", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-missing-base-"));
    try {
      fs.writeFileSync(path.join(tmpDir, "pt.json"), JSON.stringify({ nav: { home: "Início" } }));
      const exitCode = await runCli(["--dir", tmpDir, "--base", "en"]);
      expect(exitCode).toBe(1);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("exits code 0 on a valid directory and code 1 when keys are missing or stale", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-valid-"));
    try {
      const en = { nav: { home: "Home", about: "About" } };
      const ptValid = { nav: { home: "Início", about: "Sobre" } };
      fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify(en));
      fs.writeFileSync(path.join(tmpDir, "pt.json"), JSON.stringify(ptValid));

      const exitValid = await runCli(["check", "--dir", tmpDir, "--base", "en"]);
      expect(exitValid).toBe(0);

      // Add a stale key and remove a required key in pt
      const ptInvalid = { nav: { home: "Início", staleKey: "Old" } };
      fs.writeFileSync(path.join(tmpDir, "pt.json"), JSON.stringify(ptInvalid));

      const exitInvalid = await runCli(["check", "--dir", tmpDir, "--base", "en"]);
      expect(exitInvalid).toBe(1);

      // Run with --fix to auto-fix issues
      const exitFix = await runCli(["check", "--dir", tmpDir, "--base", "en", "--fix"]);
      expect(exitFix).toBe(0);

      // Verify pt.json was fixed on disk
      const ptFixedContent = JSON.parse(fs.readFileSync(path.join(tmpDir, "pt.json"), "utf-8"));
      expect(ptFixedContent.nav.home).toBe("Início");
      expect(ptFixedContent.nav.about).toBe("About");
      expect(ptFixedContent.nav.staleKey).toBeUndefined();
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("handles --allow-empty flag", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-empty-val-"));
    try {
      const en = { nav: { home: "Home", "empty-text": "" } };
      const pt = { nav: { home: "Início", "empty-text": "" } };
      fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify(en));
      fs.writeFileSync(path.join(tmpDir, "pt.json"), JSON.stringify(pt));

      const exitNoEmpty = await runCli(["check", "--dir", tmpDir, "--base", "en"]);
      expect(exitNoEmpty).toBe(1);

      const exitAllowEmpty = await runCli([
        "check",
        "--dir",
        tmpDir,
        "--base",
        "en",
        "--allow-empty",
      ]);
      expect(exitAllowEmpty).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("exits code 0 on dictionaries with numeric and boolean values", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-primitives-"));
    try {
      const en = { meta: { founded: 2023, featured: true }, nav: { home: "Home" } };
      const pt = { meta: { founded: 2022, featured: false }, nav: { home: "Início" } };
      fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify(en));
      fs.writeFileSync(path.join(tmpDir, "pt.json"), JSON.stringify(pt));

      const exitCode = await runCli(["check", "--dir", tmpDir, "--base", "en"]);
      expect(exitCode).toBe(0);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates type declaration file via 'types' action and custom --out", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-types-"));
    try {
      const en = { nav: { home: "Home", contact: "Contact" }, buttons: { save: "Save" } };
      fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify(en));

      const outPath = path.join(tmpDir, "custom", "keys.d.ts");
      const exitCode = await runCli(["types", "--dir", tmpDir, "--base", "en", "--out", outPath]);
      expect(exitCode).toBe(0);

      expect(fs.existsSync(outPath)).toBe(true);
      const content = fs.readFileSync(outPath, "utf-8");
      expect(content).toContain('declare module "@rimelight/i18n"');
      expect(content).toContain("interface TranslationRegistry");
      expect(content).toContain('"buttons.save": never;');
      expect(content).toContain('"nav.contact": never;');
      expect(content).toContain('"nav.home": never;');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("generates type declaration file via 'check --types'", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-check-types-"));
    try {
      const en = { hero: { title: "Title" } };
      fs.writeFileSync(path.join(tmpDir, "en.json"), JSON.stringify(en));

      const outPath = path.join(tmpDir, "keys.d.ts");
      const exitCode = await runCli([
        "check",
        "--dir",
        tmpDir,
        "--base",
        "en",
        "--types",
        "--out",
        outPath,
      ]);
      expect(exitCode).toBe(0);

      expect(fs.existsSync(outPath)).toBe(true);
      const content = fs.readFileSync(outPath, "utf-8");
      expect(content).toContain('"hero.title"');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
