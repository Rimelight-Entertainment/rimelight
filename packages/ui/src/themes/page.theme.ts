import { defineTheme } from "./defineTheme"

export const createPageTheme = () =>
  defineTheme({
    slots: ["root"],
    base: {
      root: ""
    },
    variants: {},
    defaultVariants: {}
  })

export default createPageTheme()
