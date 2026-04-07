import { defineConfig } from "vite-plus"

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  lint: {
    plugins: ["unicorn", "typescript", "oxc", "vitest", "jsdoc", "vue"],
    ignorePatterns: [
      "**/dist/**",
      "**/node_modules/**",
      "**/i18n.generated.d.ts",
      "**/runtime-constants.ts",
      "**/fallbacks.generated.ts",
      "**/worker-configuration.d.ts",
      "i18n-data.json"
    ],
    options: {
      typeAware: true,
      typeCheck: true
    },
    jsPlugins: ["@e18e/eslint-plugin", "eslint-plugin-regexp", "@unocss/eslint-plugin"],
    categories: {
      correctness: "error",
      suspicious: "warn",
      perf: "warn"
    },
    rules: {
      "no-console": "off",
      "no-restricted-globals": "error",
      "typescript/consistent-type-imports": "error",
      "e18e/prefer-array-from-map": "error",
      "e18e/prefer-timer-args": "error",
      "e18e/prefer-date-now": "error",
      "e18e/prefer-regex-test": "error",
      "e18e/prefer-array-some": "error",
      "regexp/no-contradiction-with-assertion": "error",
      "regexp/no-dupe-disjunctions": "error",
      "regexp/no-empty-alternative": "error",
      "regexp/no-empty-capturing-group": "error",
      "regexp/no-empty-character-class": "error",
      "regexp/no-empty-group": "error",
      "regexp/no-empty-lookarounds-assertion": "error",
      "regexp/no-escape-backspace": "error",
      "regexp/no-invalid-regexp": "error",
      "regexp/no-lazy-ends": "error",
      "regexp/no-misleading-capturing-group": "error",
      "regexp/no-misleading-unicode-character": "error",
      "regexp/no-missing-g-flag": "error",
      "regexp/no-optional-assertion": "error",
      "regexp/no-potentially-useless-backreference": "error",
      "regexp/no-super-linear-backtracking": "error",
      "regexp/no-useless-assertions": "error",
      "regexp/no-useless-backreference": "error",
      "regexp/no-useless-dollar-replacements": "error",
      "regexp/strict": "error",
      "@unocss/order": "error",
      "@unocss/order-attributify": "error",
      "@unocss/blocklist": "error",
      "@unocss/enforce-class-compile": "error"
    }
  },
  fmt: {
    ignorePatterns: [
      "**/dist/**",
      "**/node_modules/**",
      "**/i18n.generated.d.ts",
      "**/runtime-constants.ts",
      "**/fallbacks.generated.ts",
      "**/worker-configuration.d.ts",
      "i18n-data.json"
    ],
    jsdoc: {
      bracketSpacing: true,
      commentLineStrategy: "multiline"
    },
    trailingComma: "none",
    semi: false,
    quoteProps: "consistent"
  },
  run: {
    cache: true,
    tasks: {
      "audit": {
        command: "pnpm audit --audit-level=moderate"
      },
      "check:vp": {
        command: "vp check"
      },
      "check": {
        dependsOn: ["audit", "check:vp"],
        // Delegate package-specific checks to pnpm recursive
        command: "pnpm -r exec vp run check"
      },
      "fix": {
        command: "pnpm audit fix && vp check --fix"
      }
    }
  }
})
