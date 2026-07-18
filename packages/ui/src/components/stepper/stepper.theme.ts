import { defineTheme } from "../../themes/defineTheme"

export const createStepperTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createStepperTheme()
