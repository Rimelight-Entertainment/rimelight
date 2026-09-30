import type { UserConfig } from "vite-plus";

export function rimelightConfig(): UserConfig {
  return {
    lint: {
      options: {
        typeAware: true,
        typeCheck: true
      }
    },
    staged: {
      "*": "vp check --fix"
    }
  };
}
