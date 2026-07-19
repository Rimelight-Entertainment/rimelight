import { defineTheme } from "../../themes"

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
