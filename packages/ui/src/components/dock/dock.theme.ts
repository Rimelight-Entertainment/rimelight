import { defineTheme } from "../../themes/defineTheme"

export const createDockTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createDockTheme()
