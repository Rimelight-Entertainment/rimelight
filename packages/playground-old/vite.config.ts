import { defineConfig } from "vite-plus"

export default defineConfig({
  fmt: {
    ignorePatterns: ["**/worker-configuration.d.ts", "**/env.d.ts"]
  },
  run: {
    tasks: {
      check: {
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
