import { defineTheme } from "../../types/component"

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
