import { defineTheme } from "../../utils/resolver"

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
