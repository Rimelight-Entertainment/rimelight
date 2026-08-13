import { defineTheme } from "../../types/component"

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
