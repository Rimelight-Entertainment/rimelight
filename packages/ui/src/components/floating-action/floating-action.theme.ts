import { defineTheme } from "../../types/theme"

export const createFloatingActionTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createFloatingActionTheme()
