import { defineTheme } from "../../themes"

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
