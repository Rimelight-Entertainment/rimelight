import { defineTheme } from "../../resolver"

export const pageTheme = defineTheme("page", {
  slots: ["root"],
  base: {
    root: ""
  },
  variants: {},
  defaultVariants: {}
})
