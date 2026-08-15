import { defineTheme } from "../../utils/resolver"

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
