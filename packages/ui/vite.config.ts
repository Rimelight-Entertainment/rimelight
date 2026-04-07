import { defineConfig } from "vite-plus"

const KV_ID = "0463354ef4e443f2bbfc7aaee5277bce"

export default defineConfig({
  fmt: {
    ignorePatterns: ["**/worker-configuration.d.ts"]
  },
  run: {
    tasks: {
      "typegen": {
        command: "wrangler types",
        input: [{ auto: true }, "wrangler.jsonc", "!worker-configuration.d.ts"]
      },
      "check": {
        dependsOn: ["typegen"],
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
      },
      "i18n:seed": {
        dependsOn: ["i18n:bundle"],
        command: `wrangler kv bulk put i18n-data.json --local --namespace-id=${KV_ID}`
      },
      "i18n:seed:fallbacks": {
        dependsOn: ["i18n:bundle:fallbacks"],
        command: `wrangler kv bulk put i18n-data.json --local --namespace-id=${KV_ID}`
      },
      "i18n:migrate": {
        dependsOn: ["i18n:bundle"],
        command: `wrangler kv bulk put i18n-data.json --remote --namespace-id=${KV_ID}`
      },
      "i18n:migrate:fallbacks": {
        dependsOn: ["i18n:bundle:fallbacks"],
        command: `wrangler kv bulk put i18n-data.json --remote --namespace-id=${KV_ID}`
      }
    }
  }
})
