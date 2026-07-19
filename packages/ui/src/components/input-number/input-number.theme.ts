import { defineTheme } from "../../utils/defineTheme"

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
