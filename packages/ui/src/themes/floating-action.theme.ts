import { defineTheme } from "../utils/defineTheme"

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
