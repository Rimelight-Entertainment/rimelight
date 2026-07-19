import { defineTheme } from "../../themes"

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
