import { defineTheme } from "../../themes"

export const createPageAsideTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageAsideTheme()
