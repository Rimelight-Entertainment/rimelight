import { defineConfig, type PluginOption } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: solid() as PluginOption[],
  test: {
    environment: "node",
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
