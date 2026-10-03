import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/schema/index.ts",
      "src/schema/sqlite.ts",
      "src/integration.ts",
      "src/plugin.ts",
      "src/storage/index.ts",
      "src/server/index.ts",
    ],
  },
});
