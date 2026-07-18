import { defineTheme } from "../../themes/defineTheme"

export const createPageTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageTheme()
