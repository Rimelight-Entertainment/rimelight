import { defineConfig } from "vite-plus"

export default defineConfig({
  fmt: {
    ignorePatterns: ["**/worker-configuration.d.ts"]
  },
  run: {
    tasks: {
      "check": {
        command: "astro check",
        input: [{ auto: true }, "!.wrangler/**", "!.astro/**"]
      },
      "i18n:bundle": {
        command: "tsx ../../scripts/bundle-translations.ts",
        input: [
          { auto: true },
          "!i18n-data.json",
          "!src/i18n.generated.d.ts",
          "!src/domain/i18n/runtime-constants.ts"
        ]
      },
      "i18n:bundle:fallbacks": {
        command: "tsx ../../scripts/bundle-translations.ts --fallbacks",
        input: [
          { auto: true },
          "!i18n-data.json",
          "!src/i18n.generated.d.ts",
          "!src/domain/i18n/runtime-constants.ts"
        ]
      }
    }
  }
})
