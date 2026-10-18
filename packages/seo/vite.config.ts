import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
  pack: {
    entry: [
      "src/index.ts",
      "src/plugin.ts",
      "src/middleware.ts",
      "src/head.ts",
      "src/sanitize.ts",
      "src/types.ts",
      "src/sitemap.ts",
      "src/robots.ts",
      "src/rss.ts",
      "src/security.ts",
      "src/manifest.ts",
      "src/catalog.ts",
      "src/og.ts",
    ],
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
