import { defineTheme } from "../../utils/resolver"

export const createFieldsetTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createFieldsetTheme()
