import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    setupFiles: ["./test/setup.ts"],
  },
  pack: {
    entry: ["src/**/*.ts"],
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
