import { defineTheme } from "../../utils/defineTheme"

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
