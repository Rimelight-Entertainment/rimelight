import { defineTheme } from "../../themes"

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
