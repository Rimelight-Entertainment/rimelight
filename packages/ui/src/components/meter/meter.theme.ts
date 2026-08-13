import { defineTheme } from "../../types/component"

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
