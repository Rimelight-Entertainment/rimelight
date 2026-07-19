import { defineTheme } from "../../themes"

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
