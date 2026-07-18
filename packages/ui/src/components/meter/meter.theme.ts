import { defineTheme } from "../../types/theme"

export const createMeterTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createMeterTheme()
