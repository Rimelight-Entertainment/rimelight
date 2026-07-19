import { defineTheme } from "../../themes"

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
