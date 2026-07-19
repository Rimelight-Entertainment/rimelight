import { defineTheme } from "../../utils/defineTheme"

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
