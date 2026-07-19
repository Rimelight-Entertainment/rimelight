import { defineTheme } from "../../themes"

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
