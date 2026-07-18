import { defineTheme } from "../../types/theme"

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
