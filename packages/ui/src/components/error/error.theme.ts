import { defineTheme } from "../../themes/defineTheme"

export const createErrorTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createErrorTheme()
