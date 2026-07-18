import { defineTheme } from "./defineTheme"

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
