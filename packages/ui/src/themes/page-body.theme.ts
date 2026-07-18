import { defineTheme } from "./defineTheme"

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
