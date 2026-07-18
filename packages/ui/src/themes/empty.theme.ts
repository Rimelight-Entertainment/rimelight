import { defineTheme } from "./defineTheme"

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
