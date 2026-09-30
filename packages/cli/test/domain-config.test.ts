import { describe, it, expect, beforeEach, afterEach } from "vite-plus/test";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { updateDomainConfigs } from "../src/index";

const CLOUDFLARE_CONFIG = `import { bindings, defineConfig, exports, triggers, type InferEnv } from "cf/config";

const config = defineConfig({
  worker: {
    name: "starter-dot-rimelight-dot-com",
    entrypoint: "./src/fetch.ts",
    domains: ["starter.rimelight.com", "www.starter.rimelight.com"],
    env: {
      DB: bindings.d1({ id: "a6610294-e214-4d35-b841-174469da54d2" }),
      "starter-dot-rimelight-dot-com_translations": bindings.kv({ id: "8c09f90741704096bd1dcdf2abadc974" }),
      BLOB: bindings.r2({ name: "starter-dot-rimelight-dot-com" }),
      ChatRoom: bindings.durableObject({
        worker: "starter-dot-rimelight-dot-com",
        exportName: "ChatRoom"
      })
    }
  }
});

export default config;
`;

const VITE_CONFIG = `import { defineConfig } from "vite-plus";
import { seo } from "@rimelight/seo/plugin";
import { security } from "@rimelight/security/plugin";

export default defineConfig({
  plugins: [
    seo({ id: "starter.rimelight.com", url: "https://starter.rimelight.com" }),
    security({ domain: "starter.rimelight.com" })
  ]
});
`;

describe("@rimelight/cli domain configuration updates", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "rimelight-cli-test-"));
    await fs.writeFile(path.join(tmpDir, "cloudflare.config.ts"), CLOUDFLARE_CONFIG, "utf-8");
    await fs.writeFile(path.join(tmpDir, "vite.config.ts"), VITE_CONFIG, "utf-8");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should rename the worker and every name derived from the domain", async () => {
    await updateDomainConfigs(tmpDir, "my-app.com", "my-app");

    const content = await fs.readFile(path.join(tmpDir, "cloudflare.config.ts"), "utf-8");

    expect(content).toContain('name: "my-app-dot-com"');
    expect(content).toContain('domains: ["my-app.com", "www.my-app.com"]');
    // Names derived from the worker must stay in sync with `worker.name`.
    expect(content).toContain('"my-app-dot-com_translations"');
    expect(content).toContain('BLOB: bindings.r2({ name: "my-app-dot-com" })');
    expect(content).toContain('worker: "my-app-dot-com"');
    // Nothing should be left pointing at the starter.
    expect(content).not.toContain("starter");
  });

  it("should update the domain used by the seo and security plugins", async () => {
    await updateDomainConfigs(tmpDir, "my-app.com", "my-app");

    const content = await fs.readFile(path.join(tmpDir, "vite.config.ts"), "utf-8");

    expect(content).toContain('id: "my-app.com"');
    expect(content).toContain('url: "https://my-app.com"');
    expect(content).toContain('domain: "my-app.com"');
    expect(content).not.toContain("starter");
  });

  it("should fall back to the project name for the worker when no domain is provided", async () => {
    await updateDomainConfigs(tmpDir, "", "My Super App");

    const cloudflare = await fs.readFile(path.join(tmpDir, "cloudflare.config.ts"), "utf-8");
    const vite = await fs.readFile(path.join(tmpDir, "vite.config.ts"), "utf-8");

    // There is no domain to derive a worker name from, so it falls back to the
    // project name, while the starter domain itself is left alone.
    expect(cloudflare).toContain('name: "my-super-app"');
    expect(cloudflare).toContain('"my-super-app_translations"');
    expect(cloudflare).toContain('domains: ["starter.rimelight.com", "www.starter.rimelight.com"]');
    // No domain means the site plugins are left untouched.
    expect(vite).toContain('id: "starter.rimelight.com"');
  });

  it("should not fail when the config files are absent", async () => {
    const emptyDir = await fs.mkdtemp(path.join(os.tmpdir(), "rimelight-cli-empty-"));
    try {
      await expect(updateDomainConfigs(emptyDir, "my-app.com", "my-app")).resolves.toBeUndefined();
    } finally {
      await fs.rm(emptyDir, { recursive: true, force: true });
    }
  });
});
