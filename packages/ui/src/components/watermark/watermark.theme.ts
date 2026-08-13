import { defineTheme } from "../../types/component"

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
