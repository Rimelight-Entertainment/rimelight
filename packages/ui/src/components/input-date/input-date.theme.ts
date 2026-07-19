import { defineTheme } from "../../themes"

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
