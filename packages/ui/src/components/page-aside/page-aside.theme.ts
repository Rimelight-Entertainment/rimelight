import { defineTheme } from "../../types/component"

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
