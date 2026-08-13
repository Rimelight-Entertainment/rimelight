import { defineTheme } from "../../types/component"

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
