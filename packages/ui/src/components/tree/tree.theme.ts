import { defineTheme } from "../../utils/resolver"

export const createTreeTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createTreeTheme()
