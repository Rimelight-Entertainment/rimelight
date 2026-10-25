import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/index.ts", "src/prompts.ts", "src/cli.ts"],
    dts: { generator: "oxc" },
  },
});
