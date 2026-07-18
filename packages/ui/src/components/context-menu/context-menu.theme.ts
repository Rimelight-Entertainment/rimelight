import { defineTheme } from "../../types/theme"

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
