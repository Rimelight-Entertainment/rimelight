import { defineTheme } from "../utils/defineTheme"

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
