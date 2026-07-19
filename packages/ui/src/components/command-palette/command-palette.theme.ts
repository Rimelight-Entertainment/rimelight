import { defineTheme } from "../../themes"

export const createCommandPaletteTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createCommandPaletteTheme()
