import { defineTheme } from "./defineTheme"

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
