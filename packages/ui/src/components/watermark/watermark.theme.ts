import { defineTheme } from "../../types/theme"

export const createWatermarkTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createWatermarkTheme()
