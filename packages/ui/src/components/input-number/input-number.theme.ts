import { defineTheme } from "../../themes/defineTheme"

export const createInputNumberTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createInputNumberTheme()
