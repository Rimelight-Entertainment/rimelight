import { defineTheme } from "../../types/theme"

export const createPageHeaderTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageHeaderTheme()
