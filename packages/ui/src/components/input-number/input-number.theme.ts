import { defineTheme } from "../../types/component"

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
