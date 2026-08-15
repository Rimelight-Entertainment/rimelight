import { defineTheme } from "../../utils/resolver"

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
