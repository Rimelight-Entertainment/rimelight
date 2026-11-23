import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

// packages/ui defines its own node and happy-dom projects. Its config cannot be loaded as a
// root project (nested `projects`), so both are declared here, mirroring packages/ui/vite.config.ts.
// Each project needs its own solid() instance: a shared plugin instance lets the happy-dom
// project's client-build resolution leak into the node project ("renderToString is not supported").
const UI_DOM_TESTS = "test/**/*.dom.test.{ts,tsx}";
const uiVirtualModuleStubs = {
  name: "rimelight-test-virtual-modules",
  resolveId(id: string) {
    return id === "virtual:rimelight-ui" || id === "virtual:rimelight-i18n" ? id : null;
  },
  load(id: string) {
    return id === "virtual:rimelight-ui" || id === "virtual:rimelight-i18n"
      ? "export const config = {};"
      : null;
  },
};

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
    projects: [
      "packages/cms",
      "packages/config",
      "packages/i18n",
      "packages/security",
      "packages/seo",
      {
        extends: true,
        root: "packages/ui",
        plugins: [solid({ ssr: true }) as any],
        test: {
          name: "ui-node",
          environment: "node",
          setupFiles: ["test/setup.ts"],
          exclude: [UI_DOM_TESTS, "**/node_modules/**", "**/dist/**"],
        },
      },
      {
        extends: true,
        root: "packages/ui",
        plugins: [solid({ ssr: true }) as any, uiVirtualModuleStubs],
        test: {
          name: "ui-dom",
          environment: "happy-dom",
          setupFiles: ["test/setup.ts"],
          include: [UI_DOM_TESTS],
        },
      },
    ],
  },
});
