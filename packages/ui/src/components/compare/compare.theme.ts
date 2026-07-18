import { defineTheme } from "../../themes/defineTheme"

export const createCompareTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createCompareTheme()
