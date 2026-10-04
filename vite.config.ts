import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "{package.json,pnpm-workspace.yaml,pnpm-lock.yaml}": () => "pnpm audit",
    "*": "vp check --fix",
  },
  test: {
    // Exclude Playwright browser tests from the workspace-level node runner.
    // These are picked up by the per-package browser project configs instead
    // (e.g. packages/ui vite.config.ts browser project).
    exclude: ["**/*.browser.test.{ts,tsx}", "**/node_modules/**"],
  },
});
