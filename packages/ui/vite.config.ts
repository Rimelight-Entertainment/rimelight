import { defineConfig, type PluginOption } from "vite-plus";
import solid from "@solidjs/vite-plugin";
import { playwright } from "@vitest/browser-playwright";

const virtualRimelightUI = {
  name: "virtual-rimelight-ui-mock",
  resolveId(id: string) {
    if (id === "virtual:rimelight/ui") return "\0virtual:rimelight/ui";
    return null;
  },
  load(id: string) {
    if (id === "\0virtual:rimelight/ui") {
      return `export default { unstyled: false, components: { themes: {} }, icons: {} };`;
    }
    return null;
  },
};

export default defineConfig({
  plugins: [solid() as PluginOption, virtualRimelightUI as PluginOption],
  test: {
    projects: [
      {
        // Existing SSR unit tests — fast, Node-based
        test: {
          name: "unit",
          environment: "node",
          include: ["test/**/*.test.{ts,tsx}"],
          exclude: ["test/**/*.browser.test.{ts,tsx}"],
        },
      },
      {
        // Browser component tests — real Chromium via Playwright
        // extends: false so we don't inherit root plugins twice
        extends: false,
        plugins: [solid() as PluginOption, virtualRimelightUI as PluginOption],
        test: {
          name: "browser",
          include: ["test/**/*.browser.test.{ts,tsx}"],
          browser: {
            enabled: true,
            provider: playwright() as any,
            instances: [{ browser: "chromium" }],
          },
          setupFiles: ["test/setup-browser.ts"],
        },
      },
    ],
  },
  pack: {
    entry: [
      "src/plugin.ts",
      "src/head.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/shortcuts.ts",
      "src/types.ts",
      "src/icons.ts",
      "src/fonts.ts",
    ],
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
