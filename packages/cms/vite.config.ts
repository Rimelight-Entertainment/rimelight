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
      "src/services/index.ts",
      "src/storage/index.ts",
      "src/middleware/index.ts",
      "src/server/index.ts",
      "src/migrator/index.ts",
      "src/migrator/cli.ts",
      "src/cron/scheduled.ts",
      "src/mcp/index.ts",
      "src/docs/index.ts",
    ],
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
