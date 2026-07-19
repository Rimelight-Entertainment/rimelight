import { defineTheme } from "../../themes"

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
