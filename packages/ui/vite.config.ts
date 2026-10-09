import { defineConfig, type PluginOption } from "vite-plus";
import solid from "@solidjs/vite-plugin";
import { playwright } from "@vitest/browser-playwright";
import { ui } from "./src/plugin";

const uiPluginInstance = ui({
  unstyled: false,
  components: {
    themes: {
      testOverride: {
        base: { label: "overridden-label" },
        variants: {
          size: { sm: { root: "override-sm" } },
        },
      },
    },
  },
  icons: {
    customIcon: "i-custom-icon",
  },
}) as PluginOption[];

export default defineConfig({
  plugins: [solid() as PluginOption, ...uiPluginInstance],
  test: {
    projects: [
      {
        // Existing SSR unit tests — fast, Node-based
        extends: false,
        plugins: [solid({ ssr: true }) as PluginOption, ...uiPluginInstance],
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
        plugins: [solid() as PluginOption, ...uiPluginInstance],
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
  },
});
