import { defineConfig } from "vite-plus"

export default defineConfig({
  run: {
    tasks: {
      "check:vp": {
        command: "vp check --fix"
      },
      "generate:block-maps": {
        command: "node scripts/generate-block-maps.ts"
      },
      "typegen": {
        command: "wrangler types",
        input: [{ auto: true }, "!worker-configuration.d.ts"]
      },
      "sync": {
        command: "astro sync"
      },
      "check": {
        dependsOn: ["check:vp", "generate:block-maps", "typegen", "sync"],
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
