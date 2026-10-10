import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/plugin.ts",
      "src/head.ts",
      "src/sanitize.ts",
      "src/types.ts",
      "src/sitemap.ts",
      "src/robots.ts",
      "src/rss.ts",
      "src/security.ts",
      "src/manifest.ts",
      "src/catalog.ts",
      "src/og/index.ts",
      "src/assets.ts",
    ],
    deps: {
      neverBundle: [/^#rimelight/],
    },
  },
});
