import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid({ ssr: true }) as any],
  test: {
    environment: "node",
    setupFiles: ["test/setup.ts"],
  },
  pack: {
    entry: [
      "src/plugin.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/ui-config.ts",
      "src/shortcuts.ts",
      "src/types.ts",
      "src/icons.ts",
      "src/fonts.ts",
    ],
    deps: {
      neverBundle: [/^virtual:rimelight-ui/],
    },
  },
});
