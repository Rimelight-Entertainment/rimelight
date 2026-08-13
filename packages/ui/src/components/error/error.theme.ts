import { defineTheme } from "../../types/component"

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
