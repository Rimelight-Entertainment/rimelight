import { defineTheme } from "../../types/theme"

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
