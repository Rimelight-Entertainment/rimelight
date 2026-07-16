import { defineConfig } from "vite-plus"

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  lint: {
    plugins: [
      "eslint",
      "typescript",
      "unicorn",
      "oxc",
      "import",
      "jsdoc",
      "jsx-a11y",
      "node",
      "promise",
      "vitest",
      "vue"
    ],
    ignorePatterns: [
      "**/dist/**",
      "**/node_modules/**",
      "**/i18n.generated.d.ts",
      "**/runtime-constants.ts",
      "**/fallbacks.generated.ts",
      "**/worker-configuration.d.ts",
      "**/env.d.ts"
    ],
    options: {
      typeAware: true,
      typeCheck: true
    },
    jsPlugins: [
      { name: "vite-plus", specifier: "vite-plus/oxlint-plugin" },
      { name: "e18e", specifier: "@e18e/eslint-plugin" },
      { name: "regexp", specifier: "eslint-plugin-regexp" },
      { name: "@unocss", specifier: "@unocss/eslint-plugin" }
    ],
    categories: {
      correctness: "error",
      suspicious: "warn",
      perf: "warn"
    },
    rules: {
      "oxc/no-barrel-file": "off",
      "import/no-cycle": ["error", { maxDepth: 3 }],
      "no-console": "off",
      "vite-plus/prefer-vite-plus-imports": "error",
      "no-restricted-globals": "error",
      "import/no-unassigned-import": [
        "error",
        {
          allow: ["**/*.css", "**/*.sass", "**/*.scss", "**/*.less", "**/*.styl"]
        }
      ],
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
      "regexp/confusing-quantifier": "warn",
      "regexp/control-character-escape": "error",
      "regexp/negation": "error",
      "regexp/no-dupe-characters-character-class": "error",
      "regexp/no-empty-string-literal": "error",
      "regexp/no-extra-lookaround-assertions": "error",
      "regexp/no-invisible-character": "error",
      "regexp/no-legacy-features": "error",
      "regexp/no-non-standard-flag": "error",
      "regexp/no-obscure-range": "error",
      "regexp/no-octal": "error",
      "regexp/no-standalone-backslash": "error",
      "regexp/no-trivially-nested-assertion": "error",
      "regexp/no-trivially-nested-quantifier": "error",
      "regexp/no-unused-capturing-group": "warn",
      "regexp/no-useless-character-class": "error",
      "regexp/no-useless-flag": "error",
      "regexp/no-useless-lazy": "error",
      "regexp/no-useless-quantifier": "error",
      "regexp/no-useless-range": "error",
      "regexp/no-useless-set-operand": "error",
      "regexp/no-useless-string-literal": "error",
      "regexp/no-useless-two-nums-quantifier": "error",
      "regexp/no-zero-quantifier": "error",
      "regexp/optimal-lookaround-quantifier": "warn",
      "regexp/optimal-quantifier-concatenation": "error",
      "regexp/prefer-predefined-assertion": "error",
      "regexp/prefer-range": "error",
      "regexp/prefer-set-operation": "error",
      "regexp/simplify-set-operations": "error",
      "regexp/use-ignore-case": "error",
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
      "**/env.d.ts",
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
        command: "pnpm -r exec vp run check"
      },
      "fix": {
        command: "pnpm audit fix && vp check --fix"
      }
    }
  }
})
