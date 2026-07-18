import { defineTheme } from "../../themes/defineTheme"

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
