import { defineTheme } from "../../utils/resolver"

export const mainTheme = defineTheme({
  slots: ["root"],
  base: {
    root: "min-h-[calc(100vh-var(--ui-header-height))]"
  },
  variants: {},
  defaultVariants: {}
})
