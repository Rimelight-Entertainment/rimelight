import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: solid(),
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
    dts: true,
    deps: {
      neverBundle: [/^(?:virtual|cloudflare):/],
      onlyBundle: false,
    },
  },
});
