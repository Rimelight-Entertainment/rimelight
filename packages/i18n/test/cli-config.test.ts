import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCli } from "../src/cli";

const SRC_PLUGIN = path.resolve(__dirname, "../src/plugin.ts").split(path.sep).join("/");

describe("rimelight-i18n types --config", () => {
  let root: string;
  let cwd: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "i18n-cli-config-"));
    cwd = process.cwd();
    process.chdir(root);
    fs.mkdirSync(path.join(root, "src/i18n"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "src/i18n/en.json"),
      JSON.stringify({ nav: { home: "Home" } }),
    );
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.chdir(cwd);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("writes keys to the output set in the config's rimelight:i18n plugin", async () => {
    fs.writeFileSync(
      path.join(root, "vite.config.ts"),
      `import { i18n } from "${SRC_PLUGIN}";\nexport default { plugins: [i18n({ types: "gen/keys.d.ts" })] };\n`,
    );
    const code = await runCli(["types", "--config", "vite.config.ts"]);
    expect(code).toBe(0);
    expect(fs.readFileSync(path.join(root, "gen/keys.d.ts"), "utf-8")).toContain(
      '"nav.home": never;',
    );
  });

  it("fails when the config has no rimelight:i18n plugin", async () => {
    fs.writeFileSync(path.join(root, "vite.config.ts"), "export default { plugins: [] };\n");
    expect(await runCli(["types", "--config", "vite.config.ts"])).toBe(1);
  });
});
