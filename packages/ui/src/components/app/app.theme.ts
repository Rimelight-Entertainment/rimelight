import { defineTheme } from "../../types/component"

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
