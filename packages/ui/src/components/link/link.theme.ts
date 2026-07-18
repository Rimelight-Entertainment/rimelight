import { defineTheme } from "../../themes/defineTheme"

export const createLinkTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createLinkTheme()
