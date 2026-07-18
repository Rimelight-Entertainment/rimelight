import { defineTheme } from "../../types/theme"

export const createPageBodyTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageBodyTheme()
