import { defineTheme } from "../../themes/defineTheme"

export const createPageHeaderTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageHeaderTheme()
