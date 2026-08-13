import { defineTheme } from "../../types/component"

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
