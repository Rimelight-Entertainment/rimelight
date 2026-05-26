import { defineConfig } from "vite-plus"

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
  },
  fmt: {
    ignorePatterns: ["**/worker-configuration.d.ts", "**/env.d.ts"]
  },
  run: {
    cache: true,

    tasks: {
      check: {
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      }
    }
  }
})
