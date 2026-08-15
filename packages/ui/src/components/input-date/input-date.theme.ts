import { defineTheme } from "../../utils/resolver"

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
