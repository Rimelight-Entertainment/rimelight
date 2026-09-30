import type { UserConfig } from "vite-plus"

export function rimelightConfig(): UserConfig {
  return {
    lint: {
      options: {
        typeAware: true,
        typeCheck: true
      }
    },
    fmt: {
      trailingComma: "none"
    },
    staged: {
      "*": "vp check --fix"
    }
  }
}
