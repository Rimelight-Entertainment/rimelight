import { defineTheme } from "../../types/theme"

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
