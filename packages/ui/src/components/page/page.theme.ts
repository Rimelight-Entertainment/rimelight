import { defineTheme } from "../../utils/resolver"

export const pageTheme = defineTheme("page", {
  slots: ["root"],
  base: {
    root: ""
  },
  variants: {},
  defaultVariants: {}
})
