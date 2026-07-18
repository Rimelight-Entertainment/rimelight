import { defineTheme } from "./defineTheme"

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
