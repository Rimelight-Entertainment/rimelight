import { defineTheme } from "../../utils/resolver"

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
