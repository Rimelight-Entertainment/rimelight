import { defineTheme } from "../../utils/resolver"

export const createAppTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createAppTheme()
