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

export function rimelightPackConfig(options = {}) {
  const { entry = ["src/index.ts"], pack = {}, ...rest } = options
  return {
    ...rimelightConfig(),
    ...rest,
    pack: {
      entry,
      dts: true,
      ...pack
    }
  }
}
