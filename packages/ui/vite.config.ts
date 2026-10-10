import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid({ ssr: true }) as any],
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
      neverBundle: [/^#rimelight/],
    },
  },
  test: {
    environment: "node",
    setupFiles: ["test/setup.ts"],
  },
});
