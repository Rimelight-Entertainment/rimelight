import { defineTheme } from "../../utils/resolver"

export const createChatPaletteTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createChatPaletteTheme()
