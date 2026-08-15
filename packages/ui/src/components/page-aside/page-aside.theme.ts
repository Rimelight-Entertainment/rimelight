import { defineTheme } from "../../utils/resolver"

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
