import { defineConfig } from "vite-plus"

/**
 * @module @rimelight/starter Vite+ Configuration
 * This defines project-specific maintenance tasks for the monorepo task runner.
 */
export default defineConfig({
  fmt: {
    ignorePatterns: ["**/worker-configuration.d.ts"]
  },
  run: {
    tasks: {
      typegen: {
        command: "wrangler types",
        input: [{ auto: true }, "wrangler.jsonc", "!worker-configuration.d.ts"]
      },
      check: {
        dependsOn: ["typegen"],
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
