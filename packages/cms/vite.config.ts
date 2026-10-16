import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
  pack: {
    entry: [
      "src/index.ts",
      "src/plugin.ts",
      "src/schema/index.ts",
      "src/schema/sqlite.ts",
      "src/storage/index.ts",
      "src/middleware/index.ts",
      "src/server/index.ts",
    ],
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
