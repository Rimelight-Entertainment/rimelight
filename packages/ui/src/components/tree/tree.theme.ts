import { defineTheme } from "../../utils/defineTheme"

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
