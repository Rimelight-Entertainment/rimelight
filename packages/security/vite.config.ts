import { defineConfig } from "vite-plus"

export default defineConfig({
  run: {
    tasks: {
      check: {
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
