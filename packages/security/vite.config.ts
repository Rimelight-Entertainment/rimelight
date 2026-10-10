import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/middleware/index.ts",
      "src/construction/index.ts",
      "src/config/index.ts",
      "src/plugin.ts",
      "src/turnstile.ts",
      "src/head.ts",
    ],
    deps: {
      neverBundle: [/^#rimelight/],
    },
  },
});
