import { defineTheme } from "../../themes/defineTheme"

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
