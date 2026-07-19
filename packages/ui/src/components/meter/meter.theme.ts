import { defineTheme } from "../../themes"

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
