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
      "audit": {
        command: "pnpm audit --audit-level=moderate"
      },
      "typegen": {
        command: "wrangler types",
        input: [{ auto: true }, "wrangler.jsonc", "!worker-configuration.d.ts"]
      },
      "check:vp": {
        command: "vp check"
      },
      "check": {
        dependsOn: ["audit", "typegen", "check:vp"],
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      },
      "fix": {
        command: "pnpm audit fix && vp check --fix && vp run check"
      }
    }
  }
})
