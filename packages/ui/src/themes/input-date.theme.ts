import { defineTheme } from "./defineTheme"

export const createInputDateTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputDateTheme()
