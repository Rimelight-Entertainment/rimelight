import { defineTheme } from "../../themes"

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
