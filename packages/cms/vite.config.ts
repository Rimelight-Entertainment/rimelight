import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/schema/index.ts",
      "src/schema/sqlite.ts",
      "src/plugin.ts",
      "src/storage/index.ts",
      "src/server/index.ts",
      "src/middleware/index.ts",
      "src/client/index.ts",
    ],
  },
});
