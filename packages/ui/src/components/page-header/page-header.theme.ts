import { defineTheme } from "../../utils/resolver"

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
