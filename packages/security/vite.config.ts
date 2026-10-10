import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/plugin.ts", "src/middleware.ts", "src/head.ts"],
    deps: {
      neverBundle: [/^#rimelight/],
    },
  },
});
