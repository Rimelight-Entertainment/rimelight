import { defineTheme } from "../../themes/defineTheme"

export const createEmptyTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createEmptyTheme()
