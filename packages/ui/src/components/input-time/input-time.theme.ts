import { defineTheme } from "../../themes/defineTheme"

export const createInputTimeTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputTimeTheme()
