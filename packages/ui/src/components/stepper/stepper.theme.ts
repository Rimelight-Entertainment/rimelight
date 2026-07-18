import { defineTheme } from "../../types/theme"

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
