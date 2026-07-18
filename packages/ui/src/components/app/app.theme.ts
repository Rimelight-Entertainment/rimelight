import { defineTheme } from "../../types/theme"

export const createAppTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createAppTheme()
