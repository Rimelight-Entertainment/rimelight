import { defineTheme } from "../../themes"

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
