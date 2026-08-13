import { defineTheme } from "../../types/component"

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
