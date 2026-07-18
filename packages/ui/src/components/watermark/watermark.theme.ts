import { defineTheme } from "../../themes/defineTheme"

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
