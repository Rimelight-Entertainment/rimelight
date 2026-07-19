import { defineTheme } from "../../themes"

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
