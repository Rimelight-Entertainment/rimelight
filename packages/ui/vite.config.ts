import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid({ ssr: true }) as any],
  test: {
    environment: "node",
    setupFiles: ["test/setup.ts"],
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
