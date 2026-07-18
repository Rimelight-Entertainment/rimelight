import { defineTheme } from "../../types/theme"

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
