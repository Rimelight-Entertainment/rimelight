import { defineTheme } from "./defineTheme"

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
