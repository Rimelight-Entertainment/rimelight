import { defineTheme } from "../../types/theme"

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
