import { defineTheme } from "./defineTheme"

export const createContextMenuTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createContextMenuTheme()
