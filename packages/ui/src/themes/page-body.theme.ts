import { defineTheme } from "../utils/defineTheme"

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
