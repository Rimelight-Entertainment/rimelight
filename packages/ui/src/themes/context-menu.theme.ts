import { defineTheme } from "../utils/defineTheme"

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
