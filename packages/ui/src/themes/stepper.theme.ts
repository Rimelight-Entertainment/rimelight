import { defineTheme } from "./defineTheme"

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
