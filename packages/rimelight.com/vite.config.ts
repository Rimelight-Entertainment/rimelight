import { defineConfig } from "vite-plus"

export default defineConfig({
  run: {
    tasks: {
      typegen: {
        command: "wrangler types",
        input: [{ auto: true }, "!worker-configuration.d.ts"]
      },
      check: {
        dependsOn: ["typegen"],
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
