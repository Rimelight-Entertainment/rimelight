import { defineTheme } from "../../utils/defineTheme"

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
