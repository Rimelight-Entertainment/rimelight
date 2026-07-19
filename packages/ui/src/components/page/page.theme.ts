import { defineTheme } from "../../utils/defineTheme"

export const createPageTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageTheme()
