import { defineConfig } from "vite-plus"

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true
    }
  },
  fmt: {
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
      check: {
        dependsOn: [
          "@rimelight/auth#check",
          "@rimelight/cli#check",
          "@rimelight/cms#check",
          "@rimelight/docs#check",
          "@rimelight/i18n#check",
          "@rimelight/security#check",
          "@rimelight/seo#check",
          "@rimelight/ui#check",
          "rimelight-dot-com#check",
          "starter-dot-rimelight-dot-com#check"
        ],
        command: 'node -e "process.exit(0)"'
      }
    }
  }
})
