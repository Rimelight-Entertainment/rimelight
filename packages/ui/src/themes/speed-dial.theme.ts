import { defineTheme } from "../utils/defineTheme"

export const createSpeedDialTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createSpeedDialTheme()
