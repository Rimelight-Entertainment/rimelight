import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
  pack: {
    entry: ["src/index.ts", "src/plugin.ts", "src/middleware.ts", "src/cli.ts"],
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
