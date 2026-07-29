import { defineConfig } from "vite-plus"

export default defineConfig({
  run: {
    tasks: {
      "check:vp": {
        command: "vp check --fix"
      },
      "typegen": {
        command: "wrangler types",
        input: [{ auto: true }, "!worker-configuration.d.ts"]
      },
      "check": {
        dependsOn: ["check:vp", "typegen"],
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
