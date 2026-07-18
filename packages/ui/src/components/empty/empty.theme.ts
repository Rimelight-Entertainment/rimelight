import { defineTheme } from "../../types/theme"

export const createEmptyTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createEmptyTheme()
