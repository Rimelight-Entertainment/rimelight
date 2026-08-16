import { defineTheme } from "../../utils/resolver"

export const mainTheme = defineTheme("main", {
  slots: ["root"],
  base: {
    root: "min-h-[calc(100vh-var(--rl-header-height))]"
  },
  variants: {},
  defaultVariants: {}
})
