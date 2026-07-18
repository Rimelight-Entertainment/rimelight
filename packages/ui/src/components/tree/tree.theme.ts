import { defineTheme } from "../../themes/defineTheme"

export const createTreeTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createTreeTheme()
