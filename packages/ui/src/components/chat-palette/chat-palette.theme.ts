import { defineTheme } from "../../types/theme"

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
