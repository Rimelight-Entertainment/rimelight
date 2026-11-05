import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

// The package plugin provides these modules at build time; test/setup.ts replaces
// their contents with vi.mock. Web-mode transforms (happy-dom project) import-analyse
// them eagerly and need them resolvable, which the node project never requires.
const VIRTUAL_MODULES = new Set(["virtual:rimelight-ui", "virtual:rimelight-i18n"]);
const virtualModuleStubs = {
  name: "rimelight-test-virtual-modules",
  resolveId(id: string) {
    return VIRTUAL_MODULES.has(id) ? id : null;
  },
  load(id: string) {
    return VIRTUAL_MODULES.has(id) ? "export const config = {};" : null;
  },
};

// `@solidjs/web` ships a server build (renderToString only) and a client build
// (render only); node resolves the server one. Client-render tests are named
// `*.dom.test.{ts,tsx}` and run in the happy-dom project; everything else runs in node.
const DOM_TESTS = "test/**/*.dom.test.{ts,tsx}";

export default defineConfig({
  plugins: [solid({ ssr: true }) as any],
  test: {
    setupFiles: ["test/setup.ts"],
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          exclude: [DOM_TESTS, "**/node_modules/**", "**/dist/**"],
        },
      },
      {
        extends: true,
        plugins: [virtualModuleStubs],
        test: {
          name: "dom",
          environment: "happy-dom",
          include: [DOM_TESTS],
        },
      },
    ],
  },
  fmt: {
    // Written by scripts/generate-meta.ts; test/meta.test.ts compares it byte-for-byte.
    ignorePatterns: ["src/meta/generated.ts"],
  },
  pack: {
    entry: [
      "src/plugin.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/runtime.ts",
      "src/shortcuts.ts",
      "src/types.ts",
      "src/icons.ts",
      "src/fonts.ts",
    ],
    dts: { generator: "oxc" },
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
