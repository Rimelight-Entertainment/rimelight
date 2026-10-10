import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid({ ssr: true }) as any],
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
    deps: {
      neverBundle: [/^#rimelight/],
    },
  },
  test: {
    environment: "node",
  },
});
