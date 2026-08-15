import { defineTheme } from "../../utils/resolver"

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
