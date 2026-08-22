export function rimelightConfig() {
  return {
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
    staged: {
      "*": "vp check --fix"
    }
  }
}
