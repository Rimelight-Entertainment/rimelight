import { defineTheme } from "../../types/theme"

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
